"use client";
import React from "react";

import Layout from "@/layout/layout";
import { projectsQuery } from "@/state/query/project";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const router = useRouter();

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
          {projects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="block p-6 rounded-lg border hover:border-primary transition-colors"
            >
              <h2 className="font-semibold mb-2">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.owner}</p>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
