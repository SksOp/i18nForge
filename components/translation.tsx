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
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    undefined
  );
  const [isColabDialogOpen, setIsColabDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
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
      const defaultBranch = branchData.defaultBranch;
      handleBranchChange(defaultBranch);
    }
  }, [branchData]);
  const handleBranchChange = async (value: string) => {
    const loadingToast = toast.loading("Checking branch...");
    if (!id) return;
    try {
      const [fileResponse, branchResponse] = await Promise.all([
        fetch(`/api/project/meta/file?id=${id}&branch=${value}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-accessToken": session?.accessToken || "",
          },
        }),
        fetch(`/api/project/meta/branch?id=${id}&branch=${value}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-accessToken": session?.accessToken || "",
          },
        }),
      ]);

      const response = fileResponse;
      if (!response.ok) throw new Error("Failed to fetch branch files");

      const fileContent = await response.json();
      const dataForTable: Record<string, any> = {};
      if (fileContent?.fileContent) {
        fileNames.forEach((path, index) => {
          try {
            const content = fileContent.fileContent[index].content;
            if (typeof content === "object") {
              dataForTable[path] = content;
            } else if (typeof content === "string") {
              try {
                dataForTable[path] = JSON.parse(content);
              } catch (error) {
                console.error(`Error parsing content for ${path}:`, error);
                toast.error(`Error parsing content for ${path}:`, {
                  id: loadingToast,
                });
              }
            }
          } catch (error) {
            console.error(`Error parsing content for ${path}:`, error);
            toast.error(`Error parsing content for ${path}:`, {
              id: loadingToast,
            });
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

  const handleAddCollaborator = async (emails: string) => {
    const emailArray = emails.split(",").map((email) => email.trim());

    if (!emailArray.length) {
      toast.error("Please enter an email", { duration: 3000 });
      return;
    }
    emailArray.forEach(async (email) => {
      if (!id) {
        toast.error("Please select a project", { duration: 3000 });
        return;
      }
      if (email === session?.user?.email) {
        toast.error("You cannot add yourself as a collaborator", { duration: 3000 });
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        toast.error("Please enter a valid email", { duration: 3000 });
        return;
      }
    })
    setIsSendingInvite(true);
    try {
      const res = await fetch(`/api/contributor/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: id,
          email: email,
        }),
      });
      if (!res.ok) throw new Error("Failed to send invite link");
      const data = await res.json();
      setInviteLink(data.inviteLink);
      toast.success("Invite link sent successfully");
    } catch (error) {
      toast.error("Failed to send invite link");
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleCreateBranch = async () => {
    setIsCreatingBranch(true);
    try {
      const res = await fetch(
        `/api/project/meta/branch?branch=${branchName}&id=${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-accessToken": session?.accessToken || "",
          },
        }
      );
      if (!res.ok) throw new Error("Branch creation failed");

      toast.success("Branch created successfully");
      queryClient.invalidateQueries({
        queryKey: ["branches", userName, repoName],
      });
      setIsDialogOpen(false);
      await handleBranchChange(branchName);
      setBranchName("");
    } catch (err) {
      toast.error("Failed to create branch");
    }
    setIsCreatingBranch(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setBranchName("");
  };
  console.log("dataForTable", JSON.stringify(tableData, null, 2));
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
                      disabled={!branchName || isCreatingBranch}
                    >
                      {isCreatingBranch ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Add Collaborator Dialog */}
              <Dialog open={isColabDialogOpen} onOpenChange={setIsColabDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4" /> Add Collaborator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Collaborator</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      id="email"
                      placeholder="Enter emaila (comma separated emails)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {inviteLink && (
                      <div className="flex items-center gap-2">
                        <Input
                          value={inviteLink}
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteLink);
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDialogClose} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      await handleAddCollaborator(email);
                      setIsColabDialogOpen(false);
                      toast.success("Invite link sent successfully");
                    }} disabled={isSendingInvite}>
                      {isSendingInvite ? "Sending..." : "Send Invite Link"}
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
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <TranslationsTable
          data={tableData}
          fileNames={fileNames}
          filesState={filesState}
          selectedBranch={selectedBranch || ""}
          allBranches={branchData?.branches ?? []}
        />
      </div>
    </Layout>
  );
}
