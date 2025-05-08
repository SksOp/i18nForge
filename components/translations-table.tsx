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
import { Button } from "./ui/button";
import { cn } from "@/lib/utils"; // if using classnames util
import { DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Dialog, DialogContent, DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

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
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const params = useParams();
  useEffect(() => {
    setProjectId(params.id as string);
  }, [params.id]);



  useEffect(() => {
    if (!projectId) return;

    const savedDrafts = localStorage.getItem(`translation-drafts-${projectId}`);
    if (savedDrafts) {
      try {
        const parsedDrafts = JSON.parse(savedDrafts);
        setEditedValues(parsedDrafts);
      } catch (error) {
        console.error("Failed to parse saved drafts:", error);
      }
    }
  }, [projectId]);




  useEffect(() => {

    if (!projectId || editedValues.length === 0) return;
    localStorage.setItem(`translation-drafts-${projectId}`, JSON.stringify(editedValues));
  }, [editedValues, projectId]);

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

    // Don't remove from editedValues anymore - keep in draft mode
    // We now store these edits locally until commit
  };

  const [commitMessage, setCommitMessage] = useState("");
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [branchName, setBranchName] = useState("main");

  const handleCommit = async () => {
    if (!projectId) {
      console.error("Missing project ID");
      return;
    }

    try {
      // Prepare file content for commit
      // Assume that editedValues will be transformed to file content 
      // in the appropriate format for the backend

      // Format the data according to the backend's expected structure
      const transformedContent = [
        {
          path: "translations.json", // You may need to adjust this path as needed
          content: JSON.stringify(editedValues)
        }
      ];

      const requestBody = {
        branch: branchName,
        content: transformedContent
      };

      const response = await fetch(`/api/project/meta/commit?id=${projectId}&message=${encodeURIComponent(commitMessage)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to commit changes');
      }

      // Invalidate query cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ["fileContent", projectId] });

      // Clear local storage after successful commit
      localStorage.removeItem(`translation-drafts-${projectId}`);

      setEditedValues([]);
      setShowCommitDialog(false);
      setCommitMessage("");
    } catch (error) {
      console.error("Error committing changes:", error);
    }
  };

  const handleSaveAll = () => {
    editedValues.forEach((v) => {
      onTranslationUpdate?.(v.key, v.language, v.newValue);
    });
    setShowCommitDialog(true);
  };

  const clearDrafts = () => {
    if (projectId) {
      localStorage.removeItem(`translation-drafts-${projectId}`);
    }
    setEditedValues([]);
  };

  return (
    <div className="overflow-auto">
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
            <DialogDescription>
              Enter a message to describe your changes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="main"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Commit message</Label>
              <Input
                id="message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Update translations"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-transparent border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
              onClick={() => setShowCommitDialog(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              onClick={handleCommit}
            >
              Commit
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between my-2">
        <div>
          {editedValues.length > 0 && (
            <div className="text-sm text-amber-600">
              You have {editedValues.length} pending changes
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {editedValues.length > 0 && (
            <>
              <Button variant="outline" onClick={clearDrafts}>
                Discard Drafts
              </Button>
              <Button variant="default" onClick={handleSaveAll}>
                Commit Changes
              </Button>
            </>
          )}
        </div>
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