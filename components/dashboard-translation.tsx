import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';

import { getFileContent, projectQuery } from '@/state/query/project';
import { TranslationEntry } from '@/types/translations';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

import { createTableData } from '@/utils/translation-utils';

import { BranchData } from './branchList';
import TranslationDataTable from './translation-dataTable';
import { buildTranslationColumns } from './translationTable-column';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditedValue {
  key: string;
  language: string;
  newValue: string;
  originalValue: string;
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

  useEffect(() => {
    const table: Record<string, any> = {};
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
        }
      });
      const fileNames = Object.keys(table);
      setFileNames(fileNames);
      const tableData = createTableData(table);
      setDataForTable(tableData);
    }
    console.log('dataForTable', JSON.stringify(table, null, 2));
  }, [fileContent, project, selectedBranch]);

  useEffect(() => {
    if (project?.branch) {
      setSelectedBranch(project.branch);
    } else {
      setSelectedBranch('main');
    }
  }, [project]);

  if (isLoading || fileContentLoading || isBranchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

  const commitEdit = () => {
    if (!editingCell) return;
    const { key, language } = editingCell;

    const originalValue = dataForTable.find((entry) => entry.key === key)?.[language] ?? '';

    if (editValue.trim() !== originalValue?.trim()) {
      setEditedValues((prev) => {
        const existingIndex = prev.findIndex((v) => v.key === key && v.language === language);
        const updated: EditedValue = {
          key,
          language,
          newValue: editValue.trim(),
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

  const handleAI = async (key: string, value: Record<string, string>, language: string) => {
    try {
      setIsAIProcessing(true);
      const res = await fetch(`/api/ai/translation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, language }),
      });
      const data = await res.json();

      if (data.result) {
        setEditedValues((prev) => {
          const existingIndex = prev.findIndex((v) => v.key === key && v.language === language);
          const updated: EditedValue = {
            key,
            language,
            newValue: data.result.content.endsWith('\n')
              ? data.result.content.slice(0, -1)
              : data.result.content,
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

  const columns = buildTranslationColumns({
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
  });

  return (
    <div className=" h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here&apos;s a list of your translation!</p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>
      <TranslationDataTable data={dataForTable} columns={columns} />
    </div>
  );
}

export default DashboardTranslation;
