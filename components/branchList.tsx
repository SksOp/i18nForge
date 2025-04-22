"use client";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { branchQuery } from "@/state/query/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/use-debounce";
import Spinner from "./spinner";

interface BranchListProps {
    repoName: string;
    userName: string;
    onSelect: (branch: string) => void;
}

export default function BranchList({ repoName, userName, onSelect }: BranchListProps) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    console.log(userName, repoName);
    if (!userName || !repoName) {
        return null;
    }

    const { data: branchData, isLoading } = useSuspenseQuery(branchQuery(userName, repoName));

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const filteredBranches = branchData?.branches.filter((branch) =>
        branch.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) || [];

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search branches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredBranches.map((branch) => (
                    <Button
                        key={branch}
                        variant="ghost"
                        className="w-full justify-start font-mono"
                        onClick={() => onSelect(branch)}
                    >
                        {branch}
                    </Button>
                ))}
                {filteredBranches.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                        No branches found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
