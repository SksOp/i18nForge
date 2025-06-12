'use client';

import { TranslationEntry } from '@/types/translations';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

import { Textarea } from './ui/textarea';

interface BuildTranslationColumnsParams {
  fileNames: string[];
  editingCell: { key: string; language: string } | null;
  editValue: string;
  isAIProcessing: boolean;
  getEditedValue: (key: string, lang: string) => string | undefined;
  isCellEdited: (key: string, lang: string) => boolean;
  handleCellClick: (key: string, lang: string, value: string) => void;
  commitEdit: () => void;
  setEditValue: (val: string) => void;
  handleAI: (key: string, translations: Record<string, string>, lang: string) => void;
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
        const isProcessing = isAIProcessing && isEditing;

        const handleAIClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          const translations: Record<string, string> = {};

          fileNames.forEach((l) => {
            translations[l] = getEditedValue(key, l) ?? entry[l] ?? '';
          });

          handleAI(key, translations, lang);
        };

        return (
          <div
            key={`${key}-${lang}`}
            className={cn(
              'relative flex items-center gap-2 group', // group enables hover effects for child
              isEdited && 'bg-yellow-50',
            )}
          >
            {/* Green vertical line for modified cells */}
            {isEdited && (
              <div
                className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-r-md"
                title="Modified"
              />
            )}

            {/* Main cell content */}
            <div
              className={cn('flex-1 p-2 truncate cursor-pointer', isProcessing && 'opacity-50')}
              onClick={() => handleCellClick(key, lang, value)}
            >
              {isEditing ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  autoFocus
                />
              ) : (
                <span className="line-clamp-2">{value || '-'}</span>
              )}
            </div>

            {/* AI Translate button only when editing */}
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isAIProcessing}
                className={cn(
                  'h-8 w-8',
                  isProcessing && 'bg-blue-50',
                  isAIProcessing && 'cursor-not-allowed',
                )}
                onClick={handleAIClick}
                title={isAIProcessing ? 'AI Translation in progress...' : 'AI Translate'}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <Wand2 className={cn('h-4 w-4', isAIProcessing && 'opacity-50')} />
                )}
              </Button>
            )}

            {/* Undo button shown only on hover of edited cells */}
            {isEdited && !isEditing && (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1"
                title="Modified"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 h-auto"
                  onClick={() => handleUndo(key, lang)}
                >
                  Undo
                </Button>
              </div>
            )}
          </div>
        );
      },
    })),
  ];
}
