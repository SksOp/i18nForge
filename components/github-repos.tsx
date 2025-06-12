'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Eye, GitFork, Star } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  updated_at: string;
}

export function GithubRepos() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      if (!session) return;

      try {
        const response = await fetch('/api/github/repositories');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch repositories');
        }

        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [session]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-[200px]">
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-4">
        <p>Please sign in to view your repositories</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <Card key={repo.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {repo.name}
              </a>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {repo.description || 'No description available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {repo.language && (
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-primary mr-1"></span>
                  {repo.language}
                </div>
              )}
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {repo.stargazers_count}
              </div>
              <div className="flex items-center">
                <GitFork className="w-4 h-4 mr-1" />
                {repo.forks_count}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {repo.watchers_count}
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
