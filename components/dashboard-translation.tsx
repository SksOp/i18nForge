'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';

import { queryClient } from '@/state/client';
import { getFileContent, projectQuery } from '@/state/query/project';
import { TranslationEntry } from '@/types/translations';
import { useQuery } from '@tanstack/react-query';
import { jsonrepair } from 'jsonrepair';
import { Loader, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { getFileDiff } from '@/utils/computeFileDiffs';
import { createTableData, unflattenTranslations } from '@/utils/translation-utils';

import { BranchData } from './branchList';
import TranslationCommitDiff from './translation-commitDiff';
import TranslationDataTable from './translation-dataTable';
import { buildTranslationColumns } from './translationTable-column';
import { Button } from './ui/button';
import { Card, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditedValue {
  key: string;
  language: string;
  newValue: string;
  originalValue: string;
}

interface ChangedFile {
  path: string;
  oldContent: string;
  newContent: string;
  language: string;
}

function DashboardTranslation({ id }: { id: string }) {
  const { data: project, isLoading, error } = useQuery(projectQuery(id as string));
  const { data: session } = useSession();
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [dataForTable, setDataForTable] = useState<TranslationEntry[]>([]);
  const [editingCell, setEditingCell] = useState<{ key: string; language: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [branchName, setBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [originalFileContents, setOriginalFileContents] = useState<Record<string, any>>({});
  const [invalidRawContent, setInvalidRawContent] = useState<Record<string, string>>({});
  const [invalidLangs, setInvalidLangs] = useState<string[]>([]);
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const { data: fileContent, isLoading: fileContentLoading } = useQuery(
    getFileContent(id as string, session?.accessToken || '', selectedBranch || 'main'),
  );

  const {
    data: branchData,
    isLoading: isBranchLoading,
    error: branchError,
  } = useQuery({
    queryKey: ['branches', project?.owner, project?.repoName],
    queryFn: async () => {
      const response = await fetch(
        `/api/project/meta/branch?repo=${project?.repoName}&userName=${project?.owner}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-accessToken': session?.accessToken || '',
          },
        },
      );
      if (!response.ok) throw new Error('Failed to fetch branches');
      return response.json() as Promise<BranchData>;
    },
    enabled: !!project?.owner && !!project?.repoName,
  });

  const changedFiles = useMemo(() => {
    if (!dataForTable.length || !fileNames.length || !editedValues.length) {
      return [];
    }

    const changes: ChangedFile[] = [];

    try {
      // Build updated files with edits
      const updatedFlatFiles: Record<string, Record<string, string>> = {};

      fileNames.forEach((lang) => {
        updatedFlatFiles[lang] = {};
        dataForTable.forEach((entry) => {
          const edited = editedValues.find((v) => v.key === entry.key && v.language === lang);
          updatedFlatFiles[lang][entry.key] = edited?.newValue ?? entry[lang] ?? '';
        });
      });

      // Compare with original and create changed files
      fileNames.forEach((lang) => {
        try {
          if (!originalFileContents[lang]) return;

          const newNested = unflattenTranslations(updatedFlatFiles[lang]);
          const original = originalFileContents[lang];

          const oldContent = JSON.stringify(original, null, 2);
          const newContent = JSON.stringify(newNested, null, 2);

          if (oldContent !== newContent) {
            changes.push({
              path: lang,
              oldContent,
              newContent,
              language: lang,
            });
          }
        } catch (error) {
          console.error(`Error processing changes for ${lang}:`, error);
        }
      });
    } catch (error) {
      console.error('Error calculating changed files:', error);
      return [];
    }

    return changes;
  }, [dataForTable, editedValues, fileNames, originalFileContents]);

  const getChangedFilesWithOnlyLines = useMemo(() => {
    return changedFiles.map((f) => {
      const diffs = getFileDiff(f.oldContent, f.newContent);
      const diffsOnly = diffs.flatMap((part) =>
        part.added || part.removed
          ? part.value.split('\n').map((v) => `${part.added ? '+' : '-'} ${v}`)
          : [],
      );
      return { ...f, diffsOnly };
    });
  }, [changedFiles]);

  const getEditedValue = (key: string, lang: string) => {
    const found = editedValues.find((v) => v.key === key && v.language === lang);
    return found?.newValue;
  };

  const isCellEdited = (key: string, lang: string) => {
    return editedValues.some((v) => v.key === key && v.language === lang);
  };

  const handleUndo = (key: string, lang: string) => {
    setEditedValues((prev) => prev.filter((v) => !(v.key === key && v.language === lang)));
  };

  const handleCellClick = (key: string, lang: string, value: string) => {
    if (editingCell?.key === key && editingCell?.language === lang) return;
    setEditingCell({ key, language: lang });
    setEditValue(value);
  };

  const commitEdit = (value: string) => {
    if (!editingCell) return;
    const { key, language } = editingCell;

    const originalValue = dataForTable.find((entry) => entry.key === key)?.[language] ?? '';

    if (value.trim() !== originalValue.trim()) {
      setEditedValues((prev) => {
        const existingIndex = prev.findIndex((v) => v.key === key && v.language === language);
        const updated: EditedValue = {
          key,
          language,
          newValue: value.trim(),
          originalValue: originalValue.trim(),
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
  };

  const handleAI = async (
    key: string,
    value: Record<string, string>,
    language: string,
    onResult: (newVal: string) => void,
  ) => {
    try {
      setIsAIProcessing(true);

      const res = await fetch(`/api/ai/translation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, language }),
      });

      const data = await res.json();

      if (data.result) {
        const resultText = data.result.content.endsWith('\n')
          ? data.result.content.slice(0, -1)
          : data.result.content;

        onResult(resultText); // update local state

        setEditedValues((prev) => {
          const existingIndex = prev.findIndex((v) => v.key === key && v.language === language);
          const updated: EditedValue = {
            key,
            language,
            newValue: resultText,
            originalValue: value[language] || '',
          };

          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = updated;
            toast.success('AI translation completed');
            return next;
          }

          toast.success('AI translation completed');
          return [...prev, updated];
        });
      }
    } catch (error) {
      console.error('AI translation failed:', error);
      toast.error('AI translation failed');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const columns = useMemo(
    () =>
      buildTranslationColumns({
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
      }),
    [
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
    ],
  );

  useEffect(() => {
    const table: Record<string, any> = {};
    const invalidFiles: string[] = [];
    const invalidRaw: Record<string, string> = {};

    if (fileContent?.fileContent) {
      project?.paths.forEach((path, index) => {
        try {
          const content = fileContent.fileContent[index].content;
          if (typeof content === 'object') {
            table[path.language] = content;
          } else if (typeof content === 'string') {
            table[path.language] = JSON.parse(content);
          }
        } catch (error) {
          console.error(`Error parsing content for ${path.language}:`, error);
          invalidFiles.push(path.language);
          invalidRaw[path.language] = fileContent.fileContent[index].content;
          table[path.language] = {}; // so column renders
        }
      });

      setFileNames(project?.paths.map((p) => p.language) || []);
      setDataForTable(createTableData(table));
      setInvalidLangs(invalidFiles);
      setInvalidRawContent(invalidRaw);
    }
  }, [fileContent, project, selectedBranch]);

  useEffect(() => {
    if (fileContent?.fileContent) {
      const orig: Record<string, any> = {};
      project?.paths.forEach((path, idx) => {
        try {
          const cnt = fileContent.fileContent[idx].content;
          orig[path.language] = typeof cnt === 'string' ? JSON.parse(cnt) : cnt;
        } catch {
          orig[path.language] = {};
        }
      });
      setOriginalFileContents(orig);
    }
  }, [fileContent, project]);

  useEffect(() => {
    if (project?.branch) {
      setSelectedBranch(project.branch);
    } else {
      setSelectedBranch('main');
    }
  }, [project]);

  if (isLoading || fileContentLoading || isBranchLoading || isCommitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleBranchChange = async (value: string) => {
    const loadingToast = toast.loading('Checking branch...');
    if (!id) return;

    try {
      const branchResponse = await fetch(`/api/project/meta/branch?id=${id}&branch=${value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-accessToken': session?.accessToken || '',
        },
      });

      if (!branchResponse.ok) throw new Error('Failed to fetch branch files');

      // You can parse it if needed, e.g. const branch = await branchResponse.json();
      setSelectedBranch(value); // This triggers the query again
      toast.success('Branch files loaded successfully', {
        id: loadingToast,
      });
    } catch (error) {
      toast.error('Failed to load branch files', {
        id: loadingToast,
      });
    }
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim()) {
      toast.error('Branch name cannot be empty');
      return;
    }

    setIsCreatingBranch(true);

    try {
      const res = await fetch(`/api/project/meta/branch?branch=${branchName}&id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-accessToken': session?.accessToken || '',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Branch creation failed');
      }

      toast.success('Branch created successfully');

      queryClient.invalidateQueries({
        queryKey: ['branches', project?.owner, project?.repoName],
      });

      await handleBranchChange(branchName);

      // Reset branch name input
      setBranchName('');
    } catch (err: any) {
      console.error('Branch creation error:', err);
      toast.error(err.message || 'Failed to create branch');
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const handleCommit = async (msg: string, branch: string) => {
    if (!id || changedFiles.length === 0) {
      toast.info('No changes to commit.');
      return;
    }

    try {
      setIsCommitting(true);

      // Prepare commit data
      const commitData = {
        branch: branch,
        content: changedFiles.map((file) => ({
          path: file.path,
          content: file.newContent,
        })),
      };
      const res = await fetch(`/api/project/meta/commit?id=${id}&message=${msg}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-accessToken': session?.accessToken || '',
        },
        body: JSON.stringify(commitData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to commit changes');
      }

      // Success - clean up state
      queryClient.invalidateQueries({ queryKey: ['fileContent', id] });
      setEditedValues([]);
      setCommitMessage('');
      setIsCommitDialogOpen(false);
      toast.success('Changes committed successfully!');
    } catch (err: any) {
      console.error('Commit error:', err);
      toast.error(err.message || 'Commit failed.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCancelCommit = () => {
    setIsCommitDialogOpen(false);
    setCommitMessage('');
  };

  const handleFixJson = async (lang: string) => {
    try {
      const brokenJson = invalidRawContent[lang];
      const fixed = jsonrepair(brokenJson);
      const parsed = JSON.parse(fixed);

      const res = await fetch(
        `/api/project/meta/commit?id=${id}&message=fixed invalid json for ${lang}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-accessToken': session?.accessToken || '',
          },
          body: JSON.stringify({
            branch: selectedBranch || 'main',
            content: [{ path: lang, content: JSON.stringify(parsed, null, 2) }],
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Commit failed');
      }

      toast.success(`Fixed and committed ${lang} successfully`);
      queryClient.invalidateQueries({ queryKey: ['fileContent', id] });
    } catch (err: any) {
      console.error(err);
      toast.error(`Fixing failed: ${err.message}`);
    }
  };

  return (
    <div className=" h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here&apos;s a list of your translation!</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus /> Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Branch</DialogTitle>
                <DialogDescription>
                  Enter a new branch name to create it and switch to it immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  placeholder="e.g. feature-login-i18n"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  disabled={!branchName || isCreatingBranch}
                  onClick={handleCreateBranch}
                >
                  {isCreatingBranch ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger>
              <SelectValue placeholder="Checkout" />
            </SelectTrigger>
            <SelectContent className="">
              {branchData?.branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!editedValues.length}>
                Commit {editedValues.length > 0 && `(${editedValues.length})`}
              </Button>
            </DialogTrigger>
            <TranslationCommitDiff
              changedFiles={getChangedFilesWithOnlyLines}
              branches={branchData?.branches || []}
              defaultBranch={selectedBranch || 'main'}
              onCancel={handleCancelCommit}
              onConfirm={(branch, message) => {
                handleCommit(message, branch);
              }}
            />
          </Dialog>
        </div>
      </div>
      {invalidLangs.length > 0 && (
        <Card className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <CardTitle className="font-semibold">Invalid translation files detected:</CardTitle>
          <ul className="list-disc ml-5 my-2">
            {invalidLangs.map((lang) => (
              <li key={lang}>
                <span className="font-mono">{lang}</span>
                <Dialog>
                  <DialogTrigger>
                    <Button
                      size="sm"
                      className="ml-3"
                      variant="secondary"
                      // onClick={() => handleFixJson(lang)}
                    >
                      Fix & Commit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invalid JSON in {lang}</DialogTitle>
                      <DialogDescription>
                        The file for {lang} contains invalid JSON. Click "Fix & Commit" to repair it
                        automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={() => handleFixJson(lang)}
                        disabled={isCreatingBranch}
                      >
                        {isCreatingBranch ? 'Fixing...' : 'Fix & Commit'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <TranslationDataTable
        data={dataForTable}
        columns={columns}
        editedValuesCount={editedValues.length}
      />
    </div>
  );
}

export default DashboardTranslation;
