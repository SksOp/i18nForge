export type TranslationFile = Record<string, any>;
export type TranslationFiles = Record<string, TranslationFile>;

export interface TranslationEntry {
  key: string;
  [fileName: string]: string;
}