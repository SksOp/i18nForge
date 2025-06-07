import { getFileContent, projectQuery } from "@/state/query/project";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { buildTranslationColumns } from "./translationTable-column";
import { TranslationEntry } from "@/types/translations";
import TranslationDataTable from "./translation-dataTable";
import { createTableData } from "@/utils/translation-utils";
import { toast } from "sonner";

interface EditedValue {
  key: string;
  language: string;
  newValue: string;
  originalValue: string;
}
function DashboardTranslation({ id }: { id: string }) {
  const { data: project, isLoading, error } = useQuery(projectQuery(id as string));
  const { data: session } = useSession();
  const { data: fileContent, isLoading: fileContentLoading } = useQuery(
    getFileContent(id as string, session?.accessToken || "")
  );
  const [dataForTable, setDataForTable] = useState<TranslationEntry[]>([]);
  const [editingCell, setEditingCell] = useState<{ key: string; language: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editedValues, setEditedValues] = useState<EditedValue[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);


  useEffect(() => {
    const table: Record<string, any> = {};
    if (fileContent?.fileContent) {
      project?.paths.forEach((path, index) => {
        try {
          const content = fileContent.fileContent[index].content;
          if (typeof content === "object") {
            table[path.language] = content;
          } else if (typeof content === "string") {
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
    console.log("dataForTable", JSON.stringify(table, null, 2));
  }, [fileContent, project]);

  if (isLoading || fileContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  const getEditedValue = (key: string, lang: string) => editedValues[key]?.[lang];
  const isCellEdited = (key: string, lang: string) => getEditedValue(key, lang) !== undefined;

  const handleCellClick = (key: string, lang: string, value: string) => {
    setEditingCell({ key, language: lang });
    setEditValue(value);
  };

  

  const commitEdit = () => {
    if (!editingCell) return;
    const { key, language } = editingCell;
    setEditedValues((prev) => ({
      ...prev,
      [key]: { ...prev[key], [language]: editValue },
    }));
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
  });

  return (
    <div className=" h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here&apos;s a list of your translation!</p>
        </div>
        <div></div>
      </div>
      <TranslationDataTable data={dataForTable} columns={columns} />
    </div>
  );
}

export default DashboardTranslation;
