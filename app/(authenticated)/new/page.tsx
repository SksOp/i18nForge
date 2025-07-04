'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { Installation } from '@/app/api/github/installations/route';
import { Repository } from '@/app/api/github/repositories/[installtionId]/route';
import Layout from '@/layout/layout';
import { installationRepositoriesQuery, installationsQuery } from '@/state/query/installation';
import { useInfiniteQuery, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { ExternalLink, Globe, Loader, Lock, Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import useDebounce from '@/hooks/use-debounce';

const URL_FOR_INSTALL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

export default function HomePage() {
  const { data, isLoading } = useSuspenseQuery(installationsQuery());
  const [selectedInstallation, setSelectedInstallation] = useState<string>(data[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const installation = data?.find((installation) => installation.id === selectedInstallation);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Layout className="container mx-auto mt-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Let's build something new</h1>
        <p className="text-muted-foreground">
          Select a Git repository to get started with your new project
        </p>
      </div>
      <Separator className="mb-6" />
      <div className="">
        <Card className="shadow-sm mx-auto max-w-3xl w-full">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Import Git Repository</h2>
              <Select
                value={selectedInstallation}
                onValueChange={(v) => {
                  if (v === 'install') {
                    window.open(URL_FOR_INSTALL ?? '#', '_blank');
                  } else {
                    setSelectedInstallation(v);
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select a Git provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data?.map((installation) => (
                      <SelectItem key={installation.id} value={installation.id}>
                        <div className="flex items-center">
                          {installation.type === 'Organization' ? (
                            <Globe className="mr-2 h-4 w-4" />
                          ) : (
                            <User className="mr-2 h-4 w-4" />
                          )}
                          {installation.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectItem value="install">
                    <Plus className="mr-2 h-4 w-4" />
                    Install GitHub App
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data && data.length > 0 ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-[35vh]">
                  {installation && <RepoList installation={installation} />}
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 bg-primary/10 p-4 rounded-full">
                  <Button variant="default" size="icon" className="h-12 w-12 rounded-full" asChild>
                    <Link
                      href={URL_FOR_INSTALL ?? '#'}
                      className="flex items-center justify-center"
                    >
                      <Plus className="h-6 w-6" />
                    </Link>
                  </Button>
                </div>
                <h3 className="text-lg font-medium mb-2">Connect to GitHub</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Authorize GitHub to import your repositories and set up automatic deployments
                </p>
                <Button asChild>
                  <Link href={URL_FOR_INSTALL ?? '#'}>Install GitHub App</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {/* <Card className="shadow-sm max-h-[60vh] overflow-y-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Clone Template</h2>
            <p className="text-muted-foreground mb-4">
              Get started quickly with a template from our marketplace
            </p>
            <Button variant="outline" asChild>
              <Link href="#">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}

const RepoList = ({ installation }: { installation: Installation }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [isImportLoading, setIsImportLoading] = useState(false);

  const [importedProjectIds, setImportedProjectIds] = useState<Record<number, string | null>>({});

  const { data: repositories, isLoading } = useQuery(
    installationRepositoriesQuery(installation.installationId, {
      per_page: 10,
      page,
      search: debouncedSearch,
    }),
  );

  useEffect(() => {
    const checkAllProjects = async () => {
      if (!repositories) return;

      const repoNames = repositories.map((repo) => `${installation?.name}/${repo.name}`);

      const results: { isExisting: boolean; projects: { name: string; id: string }[] } =
        await checkForExistingProjects(repoNames);

      const newStatus: Record<number, string | null> = {};
      repositories.forEach((repo, i) => {
        newStatus[repo.name] =
          results?.projects.find((project) => project.name === repo.name)?.id ?? null;
      });
      setImportedProjectIds((prev) => ({ ...prev, ...newStatus }));
    };

    checkAllProjects();
  }, [repositories]);

  const checkForExistingProjects = async (names: string[]) => {
    const res = await fetch(`/api/project/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        names,
        installationId: installation.installationId,
      }),
    });
    return await res.json();
  };

  const checkForExistingProject = async (repo: Repository, installation: Installation) => {
    setIsImportLoading(true);
    try {
      const res = await fetch(`/api/project/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names: [`${installation?.name}/${repo.name}`],
          installationId: installation.installationId,
        }),
      });
      const result = await res.json();
      return result?.[`${installation?.name}/${repo.name}`];
    } catch (error) {
      setIsImportLoading(false);
      toast.error('Failed to check project status');
      return null;
    } finally {
      setIsImportLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="border rounded-md divide-y">
      {repositories && repositories.length > 0 ? (
        <>
          {repositories.map((repo: Repository) => {
            const alreadyImported = importedProjectIds[repo.name];
            return (
              <div
                key={repo.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div className="flex gap-2 items-center">
                  <span className="font-medium">{repo.name}</span>
                  {repo.private && <Lock className="w-4 h-4" />}
                </div>
                <Button
                  size="sm"
                  disabled={!!alreadyImported}
                  variant={alreadyImported ? 'outline' : 'default'}
                  onClick={async () => {
                    if (alreadyImported) return;
                    const loadingToast = toast.loading('Checking project status...');
                    const result = await checkForExistingProject(repo, installation);
                    toast.dismiss(loadingToast);

                    if (result?.projectId) {
                      router.push(`/projects/${result.projectId}`);
                    } else {
                      router.push(`/projects/new/${installation.installationId}/${repo.full_name}`);
                    }
                  }}
                >
                  {isImportLoading ? (
                    <Loader className="animate-spin w-4 h-4 mr-2" />
                  ) : alreadyImported ? (
                    'Imported'
                  ) : (
                    'Import'
                  )}
                </Button>
              </div>
            );
          })}
          {repositories.length === 10 && (
            <div className="p-4 text-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No repositories found matching your search.
        </div>
      )}
    </div>
  );
};
