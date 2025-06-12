'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';

interface TranslationCellEditorProps {
  value: string;
  editValue: string;
  isEditing: boolean;
  isEdited: boolean;
  isAIProcessing: boolean;
  onCellClick: () => void;
  onEditChange: (val: string) => void;
  onCommitEdit: (val: string) => void;
  onUndo: () => void;
  onAITranslate: (currVal: string, setVal: (newVal: string) => void) => void;
}

export const TranslationCellEditor: React.FC<TranslationCellEditorProps> = ({
  value,
  isEditing,
  isEdited,
  isAIProcessing,
  onCellClick,
  onCommitEdit,
  onUndo,
  onAITranslate,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const ignoreBlur = useRef(false);

  useEffect(() => {
    if (isEditing) setLocalValue(value);
  }, [isEditing, value]);

  const handleBlur = () => {
    if (!ignoreBlur.current) {
      onCommitEdit(localValue);
    }
  };

  const handleAI = () => {
    onAITranslate(localValue, setLocalValue);
  };

  return (
    <div className={cn('relative flex items-center gap-2 group', isEdited && 'bg-yellow-50')}>
      {isEdited && <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-r-md" />}

      <div
        className={cn('flex-1 p-2 truncate cursor-pointer', isAIProcessing && 'opacity-50')}
        onClick={onCellClick}
      >
        {isEditing ? (
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <span className="line-clamp-2">{value || '-'}</span>
        )}
      </div>

      {isEditing && (
        <Button
          variant="ghost"
          size="icon"
          disabled={isAIProcessing}
          className={cn('h-8 w-8', isAIProcessing && 'cursor-not-allowed')}
          onMouseDown={() => {
            ignoreBlur.current = true;
          }}
          onClick={(e) => {
            e.stopPropagation();
            ignoreBlur.current = false; // reset after click
            handleAI();
          }}
          title={isAIProcessing ? 'AI Translation in progress...' : 'AI Translate'}
        >
          {isAIProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {isEdited && !isEditing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
            }}
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  );
};
