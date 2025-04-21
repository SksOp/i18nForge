"use client";

import { TranslationsTable } from "@/components/translations-table";
import { createTableData } from "@/utils/translation-utils";
import { Button } from "@/components/ui/button";
import Layout from "@/layout/layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useCallback } from "react";

export default function TranslationsPage({
  files,
}: {
  files: Record<string, object>;
}) {
  const fileNames = Object.keys(files);
  const tableData = useMemo(() => createTableData(files), [files]);

  return (
    <Layout className="gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Translation Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and compare translations across all languages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled size="sm">
            + Add Language
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <TranslationsTable data={tableData} fileNames={fileNames} />
      </div>
    </Layout>
  );
}
