"use client";
import React, { useEffect } from "react";

import Layout from "@/layout/layout";
import { projectsQuery } from "@/state/query/project";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github, User } from "lucide-react";
import { format } from "date-fns";

export default function HomePage() {
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const router = useRouter();

  useEffect(() => {
    if (!projects || projects.length === 0 || projects.length === undefined) {
      router.push("/new");
    }
  }, [projects, router]);

  return (
    <Layout className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Link href="/new">
          <Button>Add New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <Link href="/new">
            <Button>Create Your First Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const githubRepoUrl = `https://github.com/${project.name}`;
            const githubProfileUrl = `https://github.com/${project.owner}`;
            const createdAtFormatted = format(
              new Date(project.createdAt),
              "PPP"
            );

            return (
              <div
                key={project.id}
                className="p-6 rounded-lg border hover:border-primary transition-colors"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <Link
                  href={githubRepoUrl}
                  target="_blank"
                  className="flex items-center space-x-2 text-lg font-semibold hover:underline w-fit"
                >
                  <Github size={18} />
                  <span>{project.name}</span>
                </Link>

                <Link
                  href={githubProfileUrl}
                  target="_blank"
                  className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground hover:underline w-fit"
                >
                  <User size={16} />
                  <span>{project.owner}</span>
                </Link>

                <p className="text-xs text-muted-foreground mt-2">
                  Created on: {createdAtFormatted}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
