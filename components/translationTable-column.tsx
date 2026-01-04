'use client';

import { TranslationEntry } from '@/types/translations';
import { ColumnDef, ColumnVisibility, Row } from '@tanstack/react-table';
import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { getMissingLanguages } from '@/utils/translation-utils';

import { cn } from '@/lib/utils';

import { TranslationCellEditor } from './translation-cellEdit';
import { Badge } from './ui/badge';
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
  invalidLangs: string[];
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
  invalidLangs,
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
        const isInvalid = invalidLangs.includes(lang);
        const isEditing = editingCell?.key === key && editingCell?.language === lang;
        const isEdited = isCellEdited(key, lang);

        const handleCellClickWrapper = () => handleCellClick(key, lang, value);

        return (
          <div className={cn(isInvalid && 'bg-red-200')}>
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
          </div>
        );
      },
    })),
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      accessorFn: (row) => {
        // Get all languages (exclude the 'key' field)
        const langs = Object.keys(row).filter((key) => key !== 'key');

        const hasMissing = langs.some((lang) => {
          const val = row?.[lang];
          return typeof val !== 'string' || val.trim() === '';
        });

        return hasMissing ? 'missing' : 'complete';
      },
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge variant={status === 'missing' ? 'destructive' : 'outline'} className="capitalize">
            {status}
          </Badge>
        );
      },
      enableColumnFilter: true,
    },
  ];
}
