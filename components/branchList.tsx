"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { branchQuery } from "@/state/query/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import Spinner from "./spinner";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BranchListProps {
  repoName: string;
  userName: string;
  onSelect: (branch: string) => void;
}
//{"defaultBranch":"test","branches":["main","test"]}
export interface BranchData {
  branches: string[];
  defaultBranch: string;
}

export default function BranchList({
  repoName,
  userName,
  onSelect,
}: BranchListProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data: session, status } = useSession();
  const [defaultBranch, setDefaultBranch] = useState("");
  if (!userName || !repoName) {
    return null;
  }

  const { data: branchData, isLoading } = useQuery({
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
      const data = await response.json() as Promise<BranchData>;
      setDefaultBranch((await data).defaultBranch);
      // console.log("defaultBranch is ", defaultBranch);
      return data;
    },
    enabled: !!userName && !!repoName,
  });

  const getDefaultBranch = async () => {
    const res = await fetch(`/api/project/meta/branch/db?repo=${repoName}&userName=${userName}`);
    const data = await res.json();
    return data.defaultBranch;
  }


  useEffect(() => {
    getDefaultBranch().then((branch) => {
      setDefaultBranch(branch);
    });
  }, [repoName, userName]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  const branches = branchData?.branches ?? [];
  const filteredBranches = debouncedSearch
    ? branches.filter((branch) =>
      branch.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : branches;
  return (
    <div className="w-full  ">
      <Select onValueChange={onSelect} defaultValue={defaultBranch}>
        <SelectTrigger className=" h-10 px-3 py-2 border rounded-md flex items-center justify-between">
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent className=" border rounded-md shadow-md">
          <div className=" relative p-2 border-b">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 "
            />
          </div>
          <SelectGroup className="max-h-[300px] overflow-y-auto p-1  ">
            {filteredBranches.map((branch: string) => (
              <SelectItem
                key={branch}
                value={branch}
                defaultValue={defaultBranch}
                className="font-mono px-2 py-1.5 rounded-sm  cursor-pointer"
              >
                {branch}
              </SelectItem>
            ))}
            {filteredBranches.length === 0 && (
              <div className="text-center text-muted-foreground  py-4">
                No branches found matching your search.
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
