"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TranslationEntry } from "@/types/translations";
import { use, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { unflattenTranslations } from "@/utils/translation-utils";

interface TranslationsTableProps {
  data: TranslationEntry[];
  fileNames: string[];
  allBranches: string[];
  selectedBranch: string;
  filesState: Record<string, any>;
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
  selectedBranch,
  allBranches,
  filesState,
  onTranslationUpdate,
}: TranslationsTableProps) {
  const [editingCell, setEditingCell] = useState<{
    key: string;
    language: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [branchName, setBranchName] = useState(selectedBranch);
  const queryClient = useQueryClient();
  const params = useParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  useEffect(() => {
    setProjectId(params.id as string);
  }, [params.id]);

  useEffect(() => {
    if (!projectId) return;
    const savedDrafts = localStorage.getItem(`translation-drafts-${projectId}`);
    if (savedDrafts) {
      try {
        setEditedValues(JSON.parse(savedDrafts));
      } catch (err) {
        console.error("Failed to load drafts:", err);
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem(
        `translation-drafts-${projectId}`,
        JSON.stringify(editedValues)
      );
    }
  }, [editedValues, projectId]);

  const isCellEdited = (key: string, language: string) =>
    editedValues.some(
      (v) =>
        v.key === key &&
        v.language === language &&
        v.newValue !== v.originalValue
    );

  const getEditedValue = (key: string, language: string) =>
    editedValues.find((v) => v.key === key && v.language === language)
      ?.newValue;

  const handleCellClick = (
    key: string,
    language: string,
    currentValue: string
  ) => {
    setEditingCell({ key, language });
    setEditValue(currentValue);
  };

  const getDefaultBranch = async () => {
    try {
      const res = await fetch(`/api/project/meta/branch/db?id=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch default branch");
      const data = await res.json();
      return data.defaultBranch;
    } catch (error) {
      console.error("Error fetching default branch:", error);
      return selectedBranch;
    }
  };

  useEffect(() => {
    if (projectId) {
      getDefaultBranch().then((branch) => {
        setBranchName(branch);
      });
    }
  }, [projectId]);

  const commitEdit = () => {
    if (editingCell) {
      const originalValue =
        data.find((d) => d.key === editingCell.key)?.[editingCell.language] ??
        "";
      setEditedValues((prev) => {
        const existingIndex = prev.findIndex(
          (v) =>
            v.key === editingCell.key && v.language === editingCell.language
        );
        const updated: EditedValue = {
          key: editingCell.key,
          language: editingCell.language,
          newValue: editValue,
          originalValue,
        };

        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = updated;
          return next;
        }
        return [...prev, updated];
      });
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    else if (e.key === "Escape") setEditingCell(null);
  };

  const handleCommit = async () => {
    if (!projectId) return;

    try {
      const updatedFlatFiles: Record<string, Record<string, string>> = {};

      // 1. Build flattened files with edits
      fileNames.forEach((lang) => {
        updatedFlatFiles[lang] = {};
        data.forEach((entry) => {
          const edited = editedValues.find(
            (v) => v.key === entry.key && v.language === lang
          );
          updatedFlatFiles[lang][entry.key] =
            edited?.newValue ?? entry[lang] ?? "";
        });
      });

      // 2. Unflatten and compare
      const changedFiles: { path: string; content: string }[] = [];

      fileNames.forEach((lang) => {
        const newNested = unflattenTranslations(updatedFlatFiles[lang]);
        const original = filesState[lang];

        const isEqual = JSON.stringify(original) === JSON.stringify(newNested);
        if (!isEqual) {
          changedFiles.push({
            path: lang,
            content: JSON.stringify(newNested, null, 2),
          });
        }
      });

      if (changedFiles.length === 0) {
        toast.info("No changes to commit.");
        return;
      }

      // 3. Commit only changed files
      setIsCommitting(true);
      const res = await fetch(
        `/api/project/meta/commit?id=${projectId}&message=${encodeURIComponent(
          commitMessage
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch: branchName,
            content: changedFiles,
          }),
        }
      );

      setIsCommitting(false);

      if (!res.ok) throw new Error("Failed to commit changes");

      queryClient.invalidateQueries({ queryKey: ["fileContent", projectId] });
      localStorage.removeItem(`translation-drafts-${projectId}`);
      setEditedValues([]);
      setShowCommitDialog(false);
      setCommitMessage("");
      toast.success("Changes committed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Commit failed.");
      setIsCommitting(false);
    }
  };

  const handleAI = async (
    key: string,
    value: Record<string, string>,
    language: string
  ) => {
    try {
      setIsAIProcessing(true);
      const res = await fetch(`/api/ai/translation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, language }),
      });
      const data = await res.json();

      if (data.result) {
        setEditedValues((prev) => {
          const existingIndex = prev.findIndex(
            (v) => v.key === key && v.language === language
          );
          const updated: EditedValue = {
            key,
            language,
            newValue: data.result.content,
            originalValue: value[language] || "",
          };

          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = updated;
            toast.success("AI translation completed");
            return next;
          }
          toast.success("AI translation completed");
          return [...prev, updated];
        });
      }
    } catch (error) {
      console.error("AI translation failed:", error);
      toast.error("AI translation failed");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const columns = useMemo<ColumnDef<TranslationEntry>[]>(
    () => [
      {
        header: "Translation Key",
        accessorKey: "key",
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
          const editedVal = getEditedValue(key, lang);
          const isEditing =
            editingCell?.key === key && editingCell?.language === lang;
          const isEdited = isCellEdited(key, lang);
          const isProcessing =
            isAIProcessing &&
            editingCell?.key === key &&
            editingCell?.language === lang;

          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "p-2 truncate cursor-pointer flex-1",
                  isEdited ? "bg-yellow-100" : "",
                  isProcessing ? "opacity-50" : ""
                )}
                onClick={() =>
                  handleCellClick(key, lang, editedVal ?? entry[lang] ?? "")
                }
              >
                {isEditing ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span className="line-clamp-2">
                    {editedVal ?? entry[lang] ?? "-"}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isAIProcessing}
                className={cn(
                  "h-8 w-8",
                  isProcessing ? "bg-blue-50" : "",
                  isAIProcessing ? "cursor-not-allowed" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  const translations: Record<string, string> = {};
                  fileNames.forEach((l) => {
                    const editedVal = getEditedValue(key, l);
                    translations[l] = editedVal ?? entry[l] ?? "";
                  });
                  handleAI(key, translations, lang);
                }}
                title={
                  isAIProcessing
                    ? "AI Translation in progress..."
                    : "AI Translate"
                }
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <Wand2
                    className={cn(
                      "h-4 w-4",
                      isAIProcessing ? "opacity-50" : ""
                    )}
                  />
                )}
              </Button>
            </div>
          );
        },
      })),
    ],
    [editingCell, editValue, editedValues, fileNames, isAIProcessing]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
            <DialogDescription>
              Enter a message for this commit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Branch</Label>
              <Select
                value={branchName}
                onValueChange={setBranchName}
                disabled={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {allBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Message</Label>
              <Input
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCommitDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCommit} disabled={isCommitting}>
              {isCommitting ? "Committing..." : "Commit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center my-4">
        {editedValues.length > 0 && (
          <div className="text-sm text-amber-600">
            {editedValues.length} pending change(s)
          </div>
        )}
        <div className="flex gap-2">
          {editedValues.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setEditedValues([])}>
                Discard Drafts
              </Button>
              <Button onClick={() => setShowCommitDialog(true)}>
                Commit Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
