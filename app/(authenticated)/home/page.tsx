'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import Layout from '@/layout/layout';
import { projectsQuery } from '@/state/query/project';
import { useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Building2, ExternalLink, FileText, Github, Plus, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  const { data: projectResponse } = useSuspenseQuery(projectsQuery());
  const router = useRouter();

  useEffect(() => {
    if (!projectResponse.projects || projectResponse.projects.length === 0 || projectResponse.projects.length === undefined) {
      router.push('/new');
    }
  }, [projectResponse]);

  if (!projectResponse.projects || projectResponse.projects.length === 0 || projectResponse.projects.length === undefined) {
    return null;
  }

  return (
    <Layout className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your translation projects</p>
        </div>
        <Link href="/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </Link>
      </div>

      {projectResponse.projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No projects found</p>
            <Link href="/new">
              <Button>Create Your First Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectResponse.projects.map((project) => {
            const githubRepoUrl = `https://github.com/${project.name}`;
            const githubProfileUrl = `https://github.com/${project.owner}`;
            const createdAtFormatted = format(new Date(project.createdAt), 'PPP');
            const languageCount = project.paths?.length || 0;
            const currentUser = projectResponse.currentUser;

            return (
              <Card
                key={project.id}
                className="hover:border-primary transition-all cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Github className="h-5 w-5" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Link href={githubRepoUrl} target="_blank" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                  <Link
                    href={githubProfileUrl}
                    target="_blank"
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:underline w-fit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.ownerType === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    <span
                      className={
                      currentUser.userName === project.owner
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground'
                      }
                    >
                      {currentUser.userName === project.owner
                      ? 'Managed By You'
                      : `Managed By ${project.owner}`}
                    </span>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="secondary" className="flex items-center">
                      <FileText className="mr-1 h-3 w-3" />
                      {languageCount} Language Files
                    </Badge>
                    <Badge variant="outline">{project.defaultBranch}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Created on {createdAtFormatted}</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
