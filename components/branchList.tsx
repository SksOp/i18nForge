"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { branchQuery } from "@/state/query/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import Spinner from "./spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";

interface BranchListProps {
    repoName: string;
    userName: string;
    onSelect: (branch: string) => void;
}

export interface BranchData {
    branches: string[];
}

export default function BranchList({ repoName, userName, onSelect }: BranchListProps) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    if (!userName || !repoName) {
        return null;
    }

    const { data: branchData, isLoading } = useQuery({
        queryKey: ['branches', userName, repoName],
        queryFn: async () => {
            const response = await fetch(`/api/project/meta/branch?repo=${repoName}&userName=${userName}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json() as Promise<BranchData>;
        },
        enabled: !!userName && !!repoName
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Spinner />
            </div>
        );
    }

    const filteredBranches = branchData?.branches?.filter((branch: string) =>
        branch.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || [];

    return (
        <div className="w-full">
            <Select onValueChange={onSelect}>
                <SelectTrigger className="w-full h-10 px-3 py-2 bg-background border rounded-md flex items-center justify-between">
                    <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent className="bg-background border rounded-md shadow-md">
                    <div className="relative p-2 border-b">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search branches..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-background"
                        />
                    </div>
                    <SelectGroup className="max-h-[300px] overflow-y-auto p-1">
                        {filteredBranches.map((branch: string) => (
                            <SelectItem
                                key={branch}
                                value={branch}
                                className="font-mono px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                            >
                                {branch}
                            </SelectItem>
                        ))}
                        {filteredBranches.length === 0 && (
                            <div className="text-center text-muted-foreground py-4">
                                No branches found matching your search.
                            </div>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
