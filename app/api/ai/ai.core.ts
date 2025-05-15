import { i18nForgePrompt } from "./ai.prompt";
import { LLMFactory, LLMProvider } from "@/llm/factory";
import { LLMService } from "@/llm/base";
import { PromptTemplate } from "@langchain/core/prompts";



export interface TranslationRequest {
    key: string;
    value: string;
    language: string;
}


export class AICoreHandler {
    private llmService: LLMService
    constructor(provider: LLMProvider) {
        this.llmService = LLMFactory.createService(provider, {
            modelName: provider === LLMProvider.OPENAI ? 'gpt-4o-mini' : 'gemini-2.0-flash',
            temperature: 0.5,
            maxTokens: 500,
            presencePenalty: 0.5,
            apiKey: process.env.GOOGLE_API_KEY ?? "",
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

        const prompt = new PromptTemplate({
            template: i18nForgePrompt,
            inputVariables: ['key', 'value', 'language']
        });



    }
}