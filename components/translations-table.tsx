import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TranslationEntry } from "@/types/translations";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils"; // if using classnames util

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
  onTranslationUpdate,
}: TranslationsTableProps) {
  const [editingCell, setEditingCell] = useState<{
    key: string;
    language: string;
  } | null>(null);

  const [editValue, setEditValue] = useState("");
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);

  const handleCellClick = (
    key: string,
    language: string,
    currentValue: string
  ) => {
    setEditingCell({ key, language });
    setEditValue(currentValue);
  };

  const handleEditChange = (value: string) => {
    setEditValue(value);
  };

  const commitEdit = () => {
    if (editingCell) {
      const originalValue =
        data.find((d) => d.key === editingCell.key)?.[editingCell.language] ||
        "";

      setEditedValues((prev) => {
        const existingIndex = prev.findIndex(
          (v) =>
            v.key === editingCell.key && v.language === editingCell.language
        );

        if (existingIndex >= 0) {
          const newValues = [...prev];
          newValues[existingIndex] = {
            ...newValues[existingIndex],
            newValue: editValue,
          };
          return newValues;
        }

        return [
          ...prev,
          {
            key: editingCell.key,
            language: editingCell.language,
            newValue: editValue,
            originalValue,
          },
        ];
      });
    }

    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const isCellEdited = (key: string, language: string) => {
    return editedValues.some(
      (v) =>
        v.key === key &&
        v.language === language &&
        v.newValue !== v.originalValue
    );
  };

  const getEditedValue = (key: string, language: string): string | undefined =>
    editedValues.find((v) => v.key === key && v.language === language)
      ?.newValue;

  const handleSaveRow = (key: string) => {
    const rowEdits = editedValues.filter((v) => v.key === key);
    rowEdits.forEach((v) => {
      onTranslationUpdate?.(v.key, v.language, v.newValue);
    });

    setEditedValues(
      (prev) => prev.filter((v) => v.key !== key) // remove after commit
    );
  };

  const handleSaveAll = () => {
    editedValues.forEach((v) => {
      onTranslationUpdate?.(v.key, v.language, v.newValue);
    });

    setEditedValues([]);
  };

  return (
    <div className="overflow-auto">
      <div className="flex justify-end my-2">
        {editedValues.length > 0 && (
          <Button variant="default" onClick={handleSaveAll}>
            Save All Changes
          </Button>
        )}
      </div>
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
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((entry) => (
              <TableRow key={entry.key}>
                <TableCell className="font-mono text-sm bg-muted/5 truncate">
                  {entry.key}
                </TableCell>
                {fileNames.map((name) => {
                  const isEditing =
                    editingCell?.key === entry.key &&
                    editingCell.language === name;

                  const editedVal = getEditedValue(entry.key, name);
                  const currentDisplayValue = editedVal ?? entry[name] ?? "";

                  const isEdited = isCellEdited(entry.key, name);

                  return (
                    <TableCell
                      key={`${entry.key}-${name}`}
                      className={cn(
                        "truncate max-w-[200px] p-0",
                        isEdited ? "bg-yellow-100" : ""
                      )}
                      onClick={() =>
                        handleCellClick(
                          entry.key,
                          name,
                          editedVal ?? entry[name] ?? ""
                        )
                      }
                    >
                      <div className="p-2">
                        {isEditing ? (
                          <Input
                            value={editValue}
                            onChange={(e) => handleEditChange(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                        ) : (
                          <span className="line-clamp-2 cursor-pointer">
                            {currentDisplayValue || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="p-2 text-center">
                  {editedValues.some((v) => v.key === entry.key) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSaveRow(entry.key)}
                    >
                      Save Row
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={fileNames.length + 2}
                className="h-24 text-center"
              >
                No translations found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
