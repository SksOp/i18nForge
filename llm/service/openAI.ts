import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMConfig, LLMResponse, LLMService, RetryHandler } from '../base';
import { BasePromptValueInterface } from '@langchain/core/prompt_values';

export class OpenAIService implements LLMService {
    private model: ChatOpenAI;
    private retryHandler: RetryHandler;

    constructor(config: LLMConfig) {
        this.model = new ChatOpenAI({
            modelName: config.modelName || 'gpt-4o-mini',
            temperature: config.temperature || 0.2,
            maxTokens: config.maxTokens || 500,
            apiKey: config.apiKey,
            presencePenalty: config.presencePenalty || 0.5,
            streaming: config.isStreaming,
        });

        this.retryHandler = new RetryHandler(config.retryConfig);
    }

    getModel(): BaseChatModel {
        return this.model;
    }

    async generateResponse(messages: BaseMessage[]): Promise<LLMResponse> {
        return this.retryHandler.executeWithRetry(async () => {
            // console.log('Calling OpenAI API');

            const promptValue = { toChatMessages: () => messages } as BasePromptValueInterface;
            const response = await this.model.generatePrompt([promptValue]);
            const firstGeneration = response.generations[0][0];

            // console.log('OpenAI API call successful', {
            model: this.model.modelName,
            });

        return {
            content: firstGeneration.text,
            model: this.model.modelName,
            usage: response.llmOutput?.tokenUsage ? {
                promptTokens: response.llmOutput.tokenUsage.promptTokens,
                completionTokens: response.llmOutput.tokenUsage.completionTokens,
                totalTokens: response.llmOutput.tokenUsage.totalTokens
            } : undefined
        };
    });
}

    async generateResponseFromTemplate(
    template: ChatPromptTemplate,
    variables: Record<string, any>
): Promise < LLMResponse > {
    const chain = template.pipe(this.model);

    return this.retryHandler.executeWithRetry(async () => {
        // console.log('Calling OpenAI API with template');

        const response = await chain.invoke(variables);

        // console.log('OpenAI API template call successful', {
        model: this.model.modelName,
            });
    return {
        content: JSON.stringify(response.content),
        model: this.model.modelName
    };
});
    }
}
