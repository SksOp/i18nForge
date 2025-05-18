import {
  TranslationEntry,
  TranslationFile,
  TranslationFiles,
} from "@/types/translations";

function flattenTranslations(
  obj: Record<string, any>,
  prefix = ""
): Record<string, string> {
  let result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, newKey));
    } else {
      // Leaf node - save the string value
      result[newKey] = value;
    }
  }

  return result;
}

function getAllKeys(files: TranslationFiles): string[] {
  const allKeysSet = new Set<string>();

  Object.values(files).forEach((fileContent) => {
    const flattened = flattenTranslations(fileContent);
    Object.keys(flattened).forEach((key) => allKeysSet.add(key));
  });

  return Array.from(allKeysSet);
}

export function createTableData(files: TranslationFiles): TranslationEntry[] {
  const allKeys = getAllKeys(files);
  const fileNames = Object.keys(files);

  return allKeys.map((key) => {
    const entry: TranslationEntry = { key };

    fileNames.forEach((fileName) => {
      const flattened = flattenTranslations(files[fileName]);
      entry[fileName] = flattened[key] || "";
    });

    return entry;
  });
}

export function unflattenTranslations(
  flatObj: Record<string, string>
): TranslationFile {
  const result: TranslationFile = {};

  for (const flatKey in flatObj) {
    const keys = flatKey.split(".");
    let current: any = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = flatObj[flatKey];
      } else {
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
    });
  }

  return result;
}

export function recreateTranslationFiles(
  tableData: TranslationEntry[]
): TranslationFiles {
  const result: TranslationFiles = {};

  if (tableData.length === 0) return result;

  const fileNames = Object.keys(tableData[0]).filter((key) => key !== "key");

  fileNames.forEach((fileName) => {
    const flatMap: Record<string, string> = {};

    tableData.forEach((entry) => {
      if (entry[fileName]) {
        flatMap[entry.key] = entry[fileName];
      }
    });

    result[fileName] = unflattenTranslations(flatMap);
  });

  return result;
}
