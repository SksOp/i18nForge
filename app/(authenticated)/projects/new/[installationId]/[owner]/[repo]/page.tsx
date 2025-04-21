"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  installationQuery,
  verifyRepoAccessQuery,
} from "@/state/query/installation";
import { Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "@/state/query/project";
import { useRouter } from "next/navigation";
import Layout from "@/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const langFileSchema = z.object({
  path: z
    .string()
    .min(1, "Path is required")
    .regex(/^\//, "Path must start with /"),
  language: z.string().min(1, "Language is required"),
});

const formSchema = z.object({
  langFiles: z.array(langFileSchema).min(1, "At least one file is required"),
});

type FormValues = z.infer<typeof formSchema>;

function ProjectForm({ owner, repo }: { owner: string; repo: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      langFiles: [
        { path: "", language: "" },
        { path: "", language: "" },
      ],
    },
  });
  const createProjectMutation = useMutation({ mutationFn: createProject });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "langFiles",
  });
  const router = useRouter();
  const onSubmit = async (data: FormValues) => {
    const project = await createProjectMutation.mutateAsync({
      name: `${owner}/${repo}`,
      owner: owner,
      ownerType: "user",
      paths: data.langFiles,
    });
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          Create Project for{" "}
          <span className="text-primary">
            {owner}/{repo}
          </span>
        </h1>
        <Separator className="mb-6" />

        <p className="text-sm text-muted-foreground mb-4">
          Note: All paths should start with / representing the root of your
          repository (e.g., /locales/en.json)
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="/path/to/file.json"
                  {...form.register(`langFiles.${index}.path`)}
                />
                {form.formState.errors.langFiles?.[index]?.path && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.langFiles[index]?.path?.message}
                  </p>
                )}
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
            onClick={() => append({ path: "", language: "" })}
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

  if (!repoAccess?.hasAccess) {
    return (
      <Layout>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Repository Access Required
            </h1>
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
      <div className="container mx-auto py-8 px-4">
        <ProjectForm owner={params.owner} repo={params.repo} />
      </div>
    </Layout>
  );
}
