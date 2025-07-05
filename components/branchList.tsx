'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { branchQuery } from '@/state/query/project';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import useDebounce from '@/hooks/use-debounce';

import Spinner from './spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface BranchListProps {
  repoName: string;
  userName: string;
  onSelect: (branch: string) => void;
  installationId: string;
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
  installationId,
}: BranchListProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: session, status } = useSession();
  const [defaultBranch, setDefaultBranch] = useState('');

  const { data: branchData, isLoading } = useQuery<BranchData>({
    queryKey: ['branches', userName, repoName, session?.accessToken],
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Access token is not available.');
      }
      const response = await fetch(
        `/api/project/meta/branch?repo=${repoName}&userName=${userName}&installationId=${installationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-accessToken': session.accessToken,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!userName && !!repoName && !!session?.accessToken,
  });

  useEffect(() => {
    if (branchData?.defaultBranch) {
      setDefaultBranch(branchData.defaultBranch);
      onSelect(branchData.defaultBranch);
    }
  }, [branchData, onSelect]);

  if (!userName || !repoName) {
    return null;
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  const branches = branchData?.branches ?? [];
  const filteredBranches = debouncedSearch
    ? branches.filter((branch) => branch.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : branches;
  return (
    <div className="w-full  ">
      <Select
        onValueChange={onSelect}
        value={defaultBranch}
        defaultValue={branchData?.defaultBranch}
      >
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
