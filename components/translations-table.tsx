import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TranslationEntry } from "@/types/translations";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TranslationsTableProps {
  data: TranslationEntry[];
  fileNames: string[];
  filters?: {
    searchTerm: string;
    selectedLanguage: string;
  };
  onTranslationUpdate?: (key: string, language: string, value: string) => void;
}

interface EditedValue {
  key: string;
  language: string;
  newValue: string;
  originalValue: string;
}

export function TranslationsTable({
  data,
  fileNames,
  onTranslationUpdate
}: TranslationsTableProps) {
  const [editingCell, setEditingCell] = useState<{ key: string, language: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);

  const handleCellClick = (key: string, language: string, currentValue: string) => {
    setEditingCell({ key, language });
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingCell && onTranslationUpdate) {
      const originalValue = data.find(d => d.key === editingCell.key)?.[editingCell.language] || "";

      // Update edited values tracking
      setEditedValues(prev => {
        const existingIndex = prev.findIndex(
          v => v.key === editingCell.key && v.language === editingCell.language
        );

        if (existingIndex >= 0) {
          const newValues = [...prev];
          newValues[existingIndex] = {
            ...newValues[existingIndex],
            newValue: editValue
          };
          return newValues;
        }

        return [...prev, {
          key: editingCell.key,
          language: editingCell.language,
          newValue: editValue,
          originalValue
        }];
      });

      onTranslationUpdate(editingCell.key, editingCell.language, editValue);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const isRowEdited = (key: string) => {
    return editedValues.some(v => v.key === key);
  };

  const isCellEdited = (key: string, language: string) => {
    return editedValues.some(v => v.key === key && v.language === language);
  };

  return (
    <Table className="table-fixed w-full">
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow>
          <TableHead className="w-[300px] bg-muted/50 font-semibold">
            Translation Key
          </TableHead>
          {fileNames.map((name) => (
            <TableHead key={name} className="min-w-[200px] font-semibold">
              {name.toUpperCase()}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((entry) => (
            <TableRow
              key={entry.key}
              className={`hover:bg-muted/10 ${isRowEdited(entry.key) ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
            >
              <TableCell
                className="font-medium truncate bg-muted/5 font-mono text-sm"
                title={entry.key}
              >
                <div className="flex items-center gap-2">
                  {entry.key}
                  {isRowEdited(entry.key) && (
                    <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30">
                      Edited
                    </Badge>
                  )}
                </div>
              </TableCell>
              {fileNames.map((name) => (
                <TableCell
                  key={`${entry.key}-${name}`}
                  className={`truncate max-w-[200px] p-0 ${isCellEdited(entry.key, name) ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                  onClick={() => handleCellClick(entry.key, name, entry[name] || "")}
                >
                  {editingCell?.key === entry.key && editingCell?.language === name ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={handleKeyDown}
                      className="h-full w-full border-0 focus-visible:ring-0"
                      autoFocus
                    />
                  ) : (
                    <div className="p-2">
                      <span className="line-clamp-2">
                        {entry[name] || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={fileNames.length + 1}
              className="h-24 text-center"
            >
              No translations found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
