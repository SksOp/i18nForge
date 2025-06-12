import { BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { LLMConfig, LLMResponse, LLMService } from './base';
import { GoogleAIService } from './service/google';
import { OpenAIService } from './service/openAI';

export enum LLMProvider {
  OPENAI = 'openai',
  GOOGLE = 'google',
}

export class LLMFactory {
  static createService(provider: LLMProvider, config: LLMConfig): LLMService {
    switch (provider) {
      case LLMProvider.OPENAI:
        return new OpenAIService(config);
      case LLMProvider.GOOGLE:
        return new GoogleAIService(config);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

export async function generateResponse(
  provider: LLMProvider,
  config: LLMConfig,
  messages: BaseMessage[],
): Promise<LLMResponse> {
  const service = LLMFactory.createService(provider, config);
  return service.generateResponse(messages);
}

export async function generateFromTemplate(
  provider: LLMProvider,
  config: LLMConfig,
  template: ChatPromptTemplate,
  variables: Record<string, any>,
): Promise<LLMResponse> {
  const service = LLMFactory.createService(provider, config);
  return service.generateResponseFromTemplate(template, variables);
}
