'use client';

import { TranslationEntry } from '@/types/translations';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

import { TranslationCellEditor } from './translation-cellEdit';
import { Textarea } from './ui/textarea';

interface BuildTranslationColumnsParams {
  fileNames: string[];
  editingCell: { key: string; language: string } | null;
  editValue: string;
  isAIProcessing: boolean;
  getEditedValue: (key: string, lang: string) => string | undefined;
  isCellEdited: (key: string, lang: string) => boolean;
  handleCellClick: (key: string, lang: string, value: string) => void;
  commitEdit: (val: string) => void;
  setEditValue: (val: string) => void;
  handleAI: (
    key: string,
    value: Record<string, string>,
    language: string,
    onResult: (newVal: string) => void,
  ) => void;
  handleUndo: (key: string, language: string) => void;
}

export function buildTranslationColumns({
  fileNames,
  editingCell,
  editValue,
  isAIProcessing,
  getEditedValue,
  isCellEdited,
  handleCellClick,
  commitEdit,
  setEditValue,
  handleAI,
  handleUndo,
}: BuildTranslationColumnsParams): ColumnDef<TranslationEntry>[] {
  return [
    {
      header: 'Translation Key',
      accessorKey: 'key',
      cell: ({ getValue }) => (
        <div className="font-mono text-sm truncate">{getValue<string>()}</div>
      ),
    },
    ...fileNames.map((lang) => ({
      header: lang.toUpperCase(),
      accessorKey: lang,
      cell: ({ row }: { row: Row<TranslationEntry> }) => {
        const entry = row.original;
        const key = entry.key;
        const value = getEditedValue(key, lang) ?? entry[lang] ?? '';
        const isEditing = editingCell?.key === key && editingCell?.language === lang;
        const isEdited = isCellEdited(key, lang);

        const handleCellClickWrapper = () => handleCellClick(key, lang, value);

        return (
          <TranslationCellEditor
            value={value}
            editValue={editValue}
            isEditing={isEditing}
            isEdited={isEdited}
            isAIProcessing={isAIProcessing}
            onCellClick={handleCellClickWrapper}
            onEditChange={setEditValue}
            onCommitEdit={commitEdit}
            onUndo={() => handleUndo(key, lang)}
            onAITranslate={(currValue, setLocalVal) => {
              const translations = Object.fromEntries(
                fileNames.map((l) => [l, getEditedValue(key, l) ?? entry[l] ?? '']),
              );
              handleAI(key, translations, lang, setLocalVal);
            }}
          />
        );
      },
    })),
  ];
}
