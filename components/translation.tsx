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
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
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
  const [filesState, setFilesState] = useState(files);
  const tableData = useMemo(() => createTableData(filesState), [filesState]);
  const params = useParams();
  const id = params.id as string;
  const [_isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    undefined
  );

  const {
    data: branchData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches", userName, repoName],
    queryFn: async () => {
      const response = await fetch(
        `/api/project/meta/branch?repo=${repoName}&userName=${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-accessToken": session?.accessToken || "",
          },
        }
      );
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

  useEffect(() => {
    if (branchData?.branches.length && !selectedBranch) {
      const defaultBranch = branchData.branches[0];
      setSelectedBranch(defaultBranch);
      handleBranchChange(defaultBranch);
    }
  }, [branchData]);

  const handleBranchChange = async (value: string) => {
    const loadingToast = toast.loading("Checking branch...");
    try {
      const response = await fetch(
        `/api/project/meta/file?id=${id}&branch=${value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-accessToken": session?.accessToken || "",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch branch files");

      const fileContent = await response.json();
      console.log("branchFiles", fileContent);
      const dataForTable: Record<string, any> = {};
      if (fileContent?.fileContent) {
        fileNames.forEach((path, index) => {
          try {
            const content = fileContent.fileContent[index].content;
            if (typeof content === "object") {
              dataForTable[path] = content;
            } else if (typeof content === "string") {
              dataForTable[path] = JSON.parse(content);
            }
          } catch (error) {
            console.error(`Error parsing content for ${path}:`, error);
          }
        });
      }
      setFilesState(dataForTable); // <-- update state
      setSelectedBranch(value);
      toast.success("Branch files loaded successfully", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error("Failed to load branch files", {
        id: loadingToast,
      });
    }
  };

  const handleCreateBranch = async () => {
    setIsLoading(true);
    const newBranch = await fetch(
      `/api/project/meta/branch?branch=${branchName}&id=${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-accessToken": session?.accessToken || "",
        },
      }
    );

    if (!newBranch.ok) {
      setIsLoading(false);
      toast.error("Failed to create branch");
    } else {
      toast.success("Branch created successfully");
      queryClient.invalidateQueries({
        queryKey: ["branches", userName, repoName],
      });
      setIsDialogOpen(false);
      await handleBranchChange(branchName);
      setSelectedBranch(branchName);
      setBranchName("");
    }
    setIsLoading(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setBranchName("");
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
            <>
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Checkout" />
                </SelectTrigger>
                <SelectContent className="">
                  {branchData?.branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Move Create Branch button outside Select */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Create Branch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Branch</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new branch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      id="branchName"
                      placeholder="feature/my-new-branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDialogClose} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBranch}
                      disabled={!branchName || _isLoading}
                    >
                      {_isLoading ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          <Button disabled size="sm">
            + Add Language
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <TranslationsTable
          data={tableData}
          fileNames={fileNames}
          selectedBranch={selectedBranch ?? "main"}
          allBranches={branchData?.branches ?? []}
        />
      </div>
    </Layout>
  );
}
