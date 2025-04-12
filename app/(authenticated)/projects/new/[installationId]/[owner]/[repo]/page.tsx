"use client";

import { useQuery } from "@tanstack/react-query";
import {
  installationQuery,
  verifyRepoAccessQuery,
} from "@/state/query/installation";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X } from "lucide-react";

interface LangFile {
  path: string;
  language: string;
}

function ProjectForm({ owner, repo }: { owner: string; repo: string }) {
  const [langFiles, setLangFiles] = useState<LangFile[]>([
    { path: "", language: "" },
    { path: "", language: "" },
  ]);

  const handleInputChange = (
    index: number,
    field: keyof LangFile,
    value: string
  ) => {
    const newLangFiles = [...langFiles];
    newLangFiles[index] = {
      ...newLangFiles[index],
      [field]: value,
    };
    setLangFiles(newLangFiles);
  };

  const addNewFile = () => {
    setLangFiles([...langFiles, { path: "", language: "" }]);
  };

  const removeFile = (index: number) => {
    const newLangFiles = langFiles.filter((_, i) => i !== index);
    setLangFiles(newLangFiles);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">
        Create Project for {owner}/{repo}
      </h1>

      <div className="space-y-4">
        {langFiles.map((file, index) => (
          <div key={index} className="flex gap-4">
            <Input
              placeholder="Path to language file"
              value={file.path}
              onChange={(e) => handleInputChange(index, "path", e.target.value)}
            />
            <Input
              placeholder="Language name"
              value={file.language}
              onChange={(e) =>
                handleInputChange(index, "language", e.target.value)
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFile(index)}
              className="shrink-0"
              disabled={langFiles.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addNewFile}>
          Add Another File
        </Button>
      </div>
    </div>
  );
}

export default function NewProjectPage({
  params,
}: {
  params: { installationId: string; owner: string; repo: string };
}) {
  const { data: installation, isLoading } = useQuery(
    installationQuery(params.installationId)
  );

  const { data: repoAccess, isLoading: isRepoAccessLoading } = useQuery(
    verifyRepoAccessQuery(params.installationId, params.owner, params.repo)
  );

  if (isLoading || isRepoAccessLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!installation) {
    return <div>Installation not found</div>;
  }

  if (!repoAccess?.hasAccess) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Repository Access Required</h1>
        <p className="mb-4">
          Additional permissions are needed to access this repository.
        </p>
        <Button asChild>
          <a
            href={`https://github.com/organizations/${params.owner}/settings/installations/${params.installationId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Grant Access
          </a>
        </Button>
      </div>
    );
  }

  return <ProjectForm owner={params.owner} repo={params.repo} />;
}
