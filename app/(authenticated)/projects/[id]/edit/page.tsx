"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader, Save } from "lucide-react";
import { getFileContent } from "@/state/query/project";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

async function projectQuery(id: string) {
    const response = await fetch(`/api/project/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch project");
    }
    return response.json();
}

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const [editedContent, setEditedContent] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const { data: fileData, isLoading: isFileLoading } = useQuery({
        queryKey: ["fileData", projectId],
        queryFn: () => getFileContent(projectId),
    });

    const {
        data: project,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => projectQuery(projectId),
    });

    useEffect(() => {
        if (fileData?.fileContent?.[0]) {
            setEditedContent(fileData.fileContent[0]);
        }
    }, [fileData]);

    const handleSave = async () => {
        if (!project) return;

        setIsSaving(true);
        try {
            const commitResponse = await fetch('/api/project/meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: 'commit',
                    owner: project.owner,
                    repo: project.name.split('/')[1],
                    path: project.paths[0].path,
                    content: editedContent,
                    message: 'Update file',
                    title: 'Update file',
                    body: 'Update file'
                })
            });

            if (!commitResponse.ok) {
                throw new Error('Failed to commit changes');
            }
            const commitData = await commitResponse.json();
            toast.success('Changes saved and PR created successfully!', {
                description: `PR #${commitData.commit.oid} created`,
                action: {
                    label: 'View PR',
                    onClick: () => window.open(commitData.commit.url, '_blank')
                }
            });
            router.push(`/projects/${projectId}`);
        } catch (error) {
            console.error('Error saving changes:', error);
            toast.error('Failed to save changes', {
                description: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isFileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-6">
                <div className="text-red-500">
                    Error loading project: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit {project.name}</h1>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                >
                    {isSaving ? (
                        <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <div className="mb-2">
                        <span className="font-medium">File Path:</span>{" "}
                        <pre className="inline">{project.paths[0].path}</pre>
                    </div>
                    <div>
                        <span className="font-medium">Language:</span> {project.paths[0].language}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">File Content</h2>
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[500px] font-mono"
                    />
                </div>
            </div>
        </div>
    );
} 