"use client";

import { GithubRepos } from "@/components/github-repos";

export default function RepositoriesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your GitHub Repositories</h1>
                <p className="text-muted-foreground mt-2">
                    Browse and manage your GitHub repositories
                </p>
            </div>
            <GithubRepos />
        </div>
    );
} 