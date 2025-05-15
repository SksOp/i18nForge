import {
  TranslationEntry,
  TranslationFile,
  TranslationFiles,
} from "@/types/translations";

export function flattenTranslations(
  obj: TranslationFile,
  prefix = ""
): Record<string, string> {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenTranslations(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }

    return acc;
  }, {} as Record<string, string>);
}

export function getAllKeys(files: TranslationFiles): string[] {
  const allKeys = new Set<string>();

  Object.values(files).forEach((file) => {
    const flattened = flattenTranslations(file);
    Object.keys(flattened).forEach((key) => allKeys.add(key));
  });

  return Array.from(allKeys).sort();
}

export function createTableData(files: TranslationFiles): TranslationEntry[] {
  const allKeys = getAllKeys(files);
  const fileNames = Object.keys(files);
  // console.log("all", allKeys);
  // console.log("files", fileNames);
  return allKeys.map((key) => {
    const entry: TranslationEntry = { key };

    fileNames.forEach((fileName) => {
      const flattened = flattenTranslations(files[fileName]);
      entry[fileName] = flattened[key] || "";
    });

    return entry;
  });
}
