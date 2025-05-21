import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';

export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export interface LLMConfig {
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    presencePenalty?: number;
    retryConfig?: Partial<RetryConfig>;
    apiKey: string;
    isStreaming: boolean;
}

export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}

export interface LLMService {
    getModel(): BaseChatModel;
    generateResponse(messages: BaseMessage[]): Promise<LLMResponse>;
    generateResponseFromTemplate(
        template: ChatPromptTemplate,
        variables: Record<string, any>
    ): Promise<LLMResponse>;
}

export class RetryHandler {
    private readonly config: Required<RetryConfig>;

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 10000,
            backoffFactor: 2,
            ...config
        };
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    calculateDelay(attempt: number): number {
        const delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt - 1);
        return Math.min(delay, this.config.maxDelay);
    }

    isRetryableError(error: any): boolean {
        const retryableErrors = [
            'rate_limit_exceeded',
            'timeout',
            'service_unavailable',
            'internal_server_error'
        ];

        return error.status === 429 || error.status >= 500 || retryableErrors.includes(error.code);
    }

    async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                // console.log(`Attempt ${attempt} of ${this.config.maxAttempts}`);
                return await operation();
            } catch (error: any) {
                lastError = error;
                console.error('API call failed', {
                    attempt,
                    error: error.message,
                    status: error.status,
                    code: error.code
                });

                if (attempt === this.config.maxAttempts || !this.isRetryableError(error)) {
                    throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
                }

                const delayMs = this.calculateDelay(attempt);
                // console.log(`Retrying in ${delayMs}ms`);
                await this.delay(delayMs);
            }
        }

        throw lastError;
    }
}
