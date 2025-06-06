'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import Layout from '@/layout/layout';
import { installationQuery, verifyRepoAccessQuery } from '@/state/query/installation';
import { createProject } from '@/state/query/project';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronRight, FileIcon, FolderIcon, Loader, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import BranchList from '@/components/branchList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';

const langFileSchema = z.object({
  path: z
    .string()
    .min(1, 'Path is required')
    .regex(/^\//, 'Path must start with /')
    .refine((path) => path.endsWith('.json'), {
      message: 'File must be a JSON file',
    }),
  language: z.string().min(1, 'Language is required'),
});

const formSchema = z.object({
  langFiles: z.array(langFileSchema).min(1, 'At least one file is required'),
});

type FormValues = z.infer<typeof formSchema>;

type FileEntry = {
  name: string;
  type: string;
  mode: string;
};

function FilePathInput({
  value,
  onChange,
  owner,
  repo,
  branch,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  owner: string;
  repo: string;
  branch: string;
  error?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const fetchFileTree = async (path: string) => {
    try {
      const response = await fetch(`/api/project/meta/tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-accessToken': session?.accessToken || '',
        },
        body: JSON.stringify({
          repo,
          userName: owner,
          branch,
          path,
        }),
      });
      const data = await response.json();
      // console.log(`Fetched tree for path: "${path}"`, data);
      return data;
    } catch (error) {
      console.error('Error fetching file tree:', error);
      return [];
    }
  };

  const { data: fileTree, refetch } = useQuery({
    queryKey: ['fileTree', repo, owner, branch, currentPath],
    queryFn: () => fetchFileTree(currentPath),
    enabled: showSuggestions || initialLoad,
  });

  // Initial load of root directory
  useEffect(() => {
    if (initialLoad && branch) {
      fetchFileTree('').then(() => {
        setInitialLoad(false);
      });
    }
  }, [branch, initialLoad]);

  useEffect(() => {
    // Handle clicks outside the suggestions dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // If first character is "/" and we haven't shown suggestions yet
    if (newValue === '/' && initialLoad) {
      setInitialLoad(false);
      setCurrentPath('');
      setShowSuggestions(true);
      return;
    }

    // If user types or adds a slash, update current path and show suggestions
    if (newValue.endsWith('/') && newValue !== value) {
      const newPath = newValue === '/' ? '' : newValue.slice(0, -1);
      setCurrentPath(newPath);
      setShowSuggestions(true);
      refetch();
    } else if (newValue.length < value.length) {
      // Handle backspace - adjust path as needed
      const lastSlashIndex = newValue.lastIndexOf('/');
      if (lastSlashIndex >= 0) {
        const parentPath = lastSlashIndex === 0 ? '' : newValue.substring(0, lastSlashIndex);
        setCurrentPath(parentPath);
        setShowSuggestions(true);
        refetch();
      }
    } else if (!newValue.endsWith('/')) {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (entry: FileEntry) => {
    const isDirectory = entry.type === 'tree';
    const newPath = currentPath ? `${currentPath}/${entry.name}` : `/${entry.name}`;

    if (isDirectory) {
      setCurrentPath(newPath);
      onChange(`${newPath}/`);
      refetch();
    } else {
      onChange(newPath);
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (value === '/' || value.endsWith('/')) {
      const path = value === '/' ? '' : value.slice(0, -1);
      setCurrentPath(path);
      setShowSuggestions(true);
      refetch();
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        placeholder="/path/to/file.json"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {showSuggestions && fileTree && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
        >
          {Array.isArray(fileTree) && fileTree.length > 0 ? (
            <ul className="py-1">
              {currentPath !== '' && (
                <li
                  className="px-3 py-2 flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                  onClick={() => {
                    const lastSlashIndex = currentPath.lastIndexOf('/');
                    const parentPath =
                      lastSlashIndex > 0 ? currentPath.substring(0, lastSlashIndex) : '';
                    setCurrentPath(parentPath);
                    onChange(parentPath ? `${parentPath}/` : '/');
                    refetch();
                  }}
                >
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  <span>Go up</span>
                </li>
              )}
              {fileTree.map((entry: FileEntry, index: number) => {
                const isJsonFile = entry.type === 'blob' && entry.name.endsWith('.json');
                const isDisabled = entry.type === 'blob' && !isJsonFile;

                return (
                  <li
                    key={index}
                    className={cn(
                      'px-3 py-2 flex items-center text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={() => !isDisabled && handleSuggestionClick(entry)}
                  >
                    {entry.type === 'tree' ? (
                      <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <FileIcon
                        className={cn(
                          'h-4 w-4 mr-2',
                          isJsonFile ? 'text-gray-500' : 'text-gray-300',
                        )}
                      />
                    )}
                    <span>{entry.name}</span>
                    {entry.type === 'tree' && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No files found or loading...</div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectForm({ owner, repo }: { owner: string; repo: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      langFiles: [
        { path: '/', language: '' },
        { path: '/', language: '' },
      ],
    },
  });
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'langFiles',
  });
  const router = useRouter();
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);

  // Get branch from URL
  const [branch, setBranch] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      const project = await createProjectMutation.mutateAsync({
        name: `${owner}/${repo}`,
        owner: owner,
        ownerType: 'user',
        paths: data.langFiles,
        branch: branch ?? defaultBranch ?? '',
        repoName: repo,
      });
      toast.success('Project created successfully');
      router.push(`/projects/${project.id}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  return (
    <Card className="shadow-sm max-w-3xl ">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          Create Project for{' '}
          <span className="text-primary">
            {owner}/{repo}
          </span>
          <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {branch}
          </span>
        </h1>
        <Separator className="mb-6" />
        <div className="mb-6 z-40 bg-white">
          <BranchList
            repoName={repo}
            userName={owner}
            onSelect={(branch) => {
              setBranch(branch);
            }}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Note: All paths should start with / representing the root of your repository. Click in the
          field or type / to browse files.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <Controller
                  control={form.control}
                  name={`langFiles.${index}.path`}
                  render={({ field, fieldState }) => (
                    <FilePathInput
                      value={field.value}
                      onChange={field.onChange}
                      owner={owner}
                      repo={repo}
                      branch={branch ?? defaultBranch ?? ''}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Input
                  className="max-w-xs"
                  placeholder="Language (e.g., English)"
                  {...form.register(`langFiles.${index}.language`)}
                />
                {form.formState.errors.langFiles?.[index]?.language && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.langFiles[index]?.language?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="shrink-0 mt-1"
                disabled={fields.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => append({ path: '/', language: '' })}
          >
            Add Another File
          </Button>

          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

type Params = Promise<{ installationId: string; owner: string; repo: string }>;
export default function NewProjectPage({ params: _params }: { params: Params }) {
  const params = use(_params);
  const { data: installation, isLoading } = useQuery(installationQuery(params.installationId));

  const { data: repoAccess, isLoading: isRepoAccessLoading } = useQuery(
    verifyRepoAccessQuery(params.installationId, params.owner, params.repo),
  );

  if (isLoading || isRepoAccessLoading) {
    return (
      <Layout>
        <div className="flex justify-center p-8">
          <Loader className="animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!installation) {
    return <div>Installation not found</div>;
  }
  const _repoAccess = repoAccess as any;
  if (!_repoAccess?.hasAccess) {
    return (
      <Layout>
        <Card className="shadow-sm ">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Repository Access Required</h1>
            <p className="text-muted-foreground mb-6">
              Additional permissions are needed to access this repository.
            </p>
            <Button asChild>
              <a
                href={`https://github.com/organizations/${params.owner}/settings/installations/${params.installationId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Grant Access on GitHub
              </a>
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 flex items-center justify-center  w-full">
        <ProjectForm owner={params.owner} repo={params.repo} />
      </div>
    </Layout>
  );
}
