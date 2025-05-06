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
import { Button } from "./ui/button";

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

  const handleSave = () => {
    if (editingCell && onTranslationUpdate) {
      if (
        !confirm(
          `Save changes to "${editingCell.key}" in "${editingCell.language}"?`
        )
      ) {
        setEditingCell(null);
        return;
      }

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

      onTranslationUpdate(editingCell.key, editingCell.language, editValue);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const isRowEdited = (key: string) => {
    return editedValues.some((v) => v.key === key);
  };

  const isCellEdited = (key: string, language: string) => {
    return editedValues.some((v) => v.key === key && v.language === language);
  };

  return (
    <>
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
                className={`hover:bg-muted/10 ${
                  isRowEdited(entry.key)
                    ? "bg-yellow-50 dark:bg-yellow-950/20"
                    : ""
                }`}
              >
                <TableCell
                  className="font-medium truncate bg-muted/5 font-mono text-sm"
                  title={entry.key}
                >
                  <div className="flex items-center gap-2">
                    {entry.key}
                    {isRowEdited(entry.key) && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 dark:bg-yellow-900/30"
                      >
                        Edited
                      </Badge>
                    )}
                  </div>
                </TableCell>
                {fileNames.map((name) => (
                  <TableCell
                    key={`${entry.key}-${name}`}
                    className={`truncate max-w-[200px] p-0 ${
                      isCellEdited(entry.key, name)
                        ? "bg-yellow-100 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-700"
                        : ""
                    }`}
                    onClick={() =>
                      handleCellClick(entry.key, name, entry[name] || "")
                    }
                  >
                    {editingCell?.key === entry.key &&
                    editingCell?.language === name ? (
                      <div className="flex gap-2 p-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8 w-full border border-muted-foreground"
                          autoFocus
                        />
                        <Button
                          onClick={handleSave}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingCell(null)}
                          className="text-xs bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
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
      {editedValues.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to commit all changes?")) {
                  editedValues.forEach((ev) => {
                    onTranslationUpdate?.(ev.key, ev.language, ev.newValue);
                  });
                  setEditedValues([]);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded"
            >
              Commit All Changes
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to discard all changes?")) {
                  setEditedValues([]);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded"
            >
              Discard All
            </button>
          </div>

          <div className="border border-muted p-4 rounded">
            <h4 className="font-semibold mb-2">Pending Changes:</h4>
            {editedValues.map((ev, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-2 py-1 border-b"
              >
                <div className="text-sm font-mono truncate">
                  {ev.key} → [{ev.language}]:{" "}
                  <span className="line-through text-muted-foreground">
                    {ev.originalValue}
                  </span>{" "}
                  →{" "}
                  <span className="text-yellow-700 font-semibold">
                    {ev.newValue}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Commit change for "${ev.key}" in "${ev.language}"?`
                      )
                    ) {
                      onTranslationUpdate?.(ev.key, ev.language, ev.newValue);
                      setEditedValues((prev) =>
                        prev.filter(
                          (v) =>
                            !(v.key === ev.key && v.language === ev.language)
                        )
                      );
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Commit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
