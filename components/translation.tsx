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
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BranchData } from "./branchList";
import { toast } from "sonner";
import { queryClient } from "@/state/client";
import { useParams } from "next/navigation";
import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
export default function TranslationsPage({
  files,
  userName,
  repoName,
}: {
  files: Record<string, object>;
  userName: string;
  repoName: string;
}) {
  const fileNames = Object.keys(files);
  const tableData = useMemo(() => createTableData(files), [files]);
  const params = useParams();
  const id = params.id as string;
  const [_isLoading, setIsLoading] = useState(false);

  const { data: branchData, isLoading, error } = useQuery({
    queryKey: ['branches', userName, repoName],
    queryFn: async () => {
      const response = await fetch(`/api/project/meta/branch?repo=${repoName}&userName=${userName}`);
      if (!response.ok) throw new Error("Failed to fetch branches");
      return response.json() as Promise<BranchData>;
    },
    enabled: !!userName && !!repoName,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch branches");
    }
  }, [error]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState("");

  const handleBranchChange = async (value: string) => {
    if (value === "Create Branch") {
      setIsDialogOpen(true);
    } else {
      const loadingToast = toast.loading("Checking branch...");
      try {
        const response = await fetch(`/api/project/meta/branch/files?branch=${value}&id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch branch files");
        }
        const branchFiles = await response.json();
        // Update files and trigger re-render of table
        // const newTableData = createTableData(branchFiles);
        // setTableData(newTableData);
        toast.success("Branch files loaded successfully", {
          id: loadingToast
        });
      } catch (error) {
        toast.error("Failed to load branch files", {
          id: loadingToast
        });
      }
    }
  };

  const handleCreateBranch = async () => {
    setIsLoading(true);
    const newBranch = await fetch(`/api/project/meta/branch?branch=${branchName}&id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!newBranch.ok) {
      setIsLoading(false);
      toast.error("Failed to create branch");
    } else {
      toast.success("Branch created successfully");
      queryClient.invalidateQueries({ queryKey: ['branches', userName, repoName] });
      setIsDialogOpen(false);
      setBranchName("");
    }
    setIsLoading(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setBranchName("");

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
            <DialogDescription>
              Enter a name for your new branch
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="branchName"
                placeholder="feature/my-new-branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreateBranch} disabled={!branchName}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
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
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading branches...</p>
          ) : (
            <Select onValueChange={handleBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Checkout" />
              </SelectTrigger>
              <SelectContent>
                {branchData?.branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
                <SelectItem value="Create Branch">
                  Create Branch
                </SelectItem>
              </SelectContent>
            </Select>
          )}

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