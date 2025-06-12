import { LLMProvider } from '../llm/factory';
import { AICoreHandler } from './ai.core';

export const AIAPI = {
  translation: (key: string, value: Record<string, string>, language: string) => {
    const aiCoreHandler = new AICoreHandler(LLMProvider.GOOGLE);
    return aiCoreHandler.TranslationHandler({ key, value, language });
  },
};
