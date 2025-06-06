import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage } from '@langchain/core/messages';
import { BasePromptValueInterface } from '@langchain/core/prompt_values';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { LLMConfig, LLMResponse, LLMService, RetryHandler } from '../base';

export class GoogleAIService implements LLMService {
  private model: ChatGoogleGenerativeAI;
  private retryHandler: RetryHandler;

  constructor(config: LLMConfig) {
    this.model = new ChatGoogleGenerativeAI({
      modelName: config.modelName || 'gemini-1.5-flash-8b',
      temperature: config.temperature || 0.2,
      maxOutputTokens: config.maxTokens || 500,
      apiKey: config.apiKey,
      streaming: config.isStreaming,
    });

    this.retryHandler = new RetryHandler(config.retryConfig);
  }

  getModel(): BaseChatModel {
    return this.model;
  }

  async generateResponse(messages: BaseMessage[]): Promise<LLMResponse> {
    return this.retryHandler.executeWithRetry(async () => {
      console.log('Calling Google AI API');

      const promptValue = { toChatMessages: () => messages } as BasePromptValueInterface;
      const response = await this.model.generatePrompt([promptValue]);
      const firstGeneration = response.generations[0][0];

      console.log('Google AI API call successful', {
        model: this.model.modelName,
      });

      return {
        content: firstGeneration.text,
        model: this.model.modelName,
        usage: response.llmOutput?.tokenUsage
          ? {
              promptTokens: response.llmOutput.tokenUsage.promptTokens,
              completionTokens: response.llmOutput.tokenUsage.completionTokens,
              totalTokens: response.llmOutput.tokenUsage.totalTokens,
            }
          : undefined,
      };
    });
  }

  public async generateResponseFromTemplate(
    template: ChatPromptTemplate,
    variables: Record<string, any>,
  ): Promise<LLMResponse> {
    const chain = template.pipe(this.model);

    return this.retryHandler.executeWithRetry(async () => {
      console.log('Calling Google AI API with template');
      const response = await chain.invoke(variables);
      console.log('Google AI template call successful', {
        model: this.model.modelName,
      });

      return {
        content: response.content as string,
        model: this.model.modelName,
      };
    });
  }
}
