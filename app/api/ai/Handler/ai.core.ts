import { i18nForgePrompt } from "./ai.prompt";
import { LLMFactory, LLMProvider } from "@/llm/factory";
import { LLMService } from "@/llm/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";

export interface TranslationRequest {
    key: string;
    value: Record<string, string>;
    language: string;
}

export class AICoreHandler {
    private llmService: LLMService;

    constructor(provider: LLMProvider) {
        this.llmService = LLMFactory.createService(provider, {
            modelName: provider === LLMProvider.OPENAI ? 'gpt-4o-mini' : 'gemini-2.0-flash',
            temperature: 0.1, /** we don't want to be creative */
            maxTokens: 500,
            presencePenalty: 0.5,
            apiKey: provider === LLMProvider.OPENAI
                ? process.env.OPENAI_API_KEY ?? ""
                : process.env.GOOGLE_API_KEY ?? "",
            retryConfig: {
                maxAttempts: 3,
                initialDelay: 1000,
                maxDelay: 10000,
                backoffFactor: 2,
            },
            isStreaming: false
        });
    }

    public async TranslationHandler(request: TranslationRequest) {
        const llmMessage: BaseMessage[] = [
            new SystemMessage(i18nForgePrompt),
            new HumanMessage(JSON.stringify(request))
        ]
        const result = await this.llmService.generateResponse(llmMessage);
        // console.dir(result, { depth: null });
        return result
    }
}