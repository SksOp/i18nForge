"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  installationsQuery,
  installationRepositoriesQuery,
} from "@/state/query/installation";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Installation } from "@/app/api/github/installations/route";
import { User, Plus, Globe, ExternalLink, Loader } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const URL_FOR_INSTALL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

export default function HomePage() {
  const { data, isLoading } = useSuspenseQuery(installationsQuery());
  const [selectedInstallation, setSelectedInstallation] = useState<string>(
    data[0].id
  );

  const installation = data?.find(
    (installation) => installation.id === selectedInstallation
  );

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Select
          value={selectedInstallation}
          onValueChange={setSelectedInstallation}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select an installation" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {data && data.length > 0
                ? data.map((installation: Installation) => (
                    <SelectItem key={installation.id} value={installation.id}>
                      {installation.type === "Organization" ? (
                        <Globe className="mr-2 h-4 w-4 inline" />
                      ) : (
                        <User className="mr-2 h-4 w-4 inline" />
                      )}
                      {installation.name}
                    </SelectItem>
                  ))
                : null}
              <Button
                variant="ghost"
                className="w-full justify-start text-sm font-normal"
                asChild
              >
                <Link
                  href={URL_FOR_INSTALL ?? "#"}
                  className="flex items-center"
                  target="_blank"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Install App
                </Link>
              </Button>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {installation && <RepoList installation={installation} />}
    </div>
  );
}

export const RepoList = ({ installation }: { installation: Installation }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...installationRepositoriesQuery(installation.installationId, {
        per_page: 10,
        search: debouncedSearch,
      }),
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === 10 ? pages.length + 1 : null;
      },
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data?.pages]
  );

  const table = useReactTable({
    data: flatData,
    columns: [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={row.original.html_url}
              target="_blank"
              className="flex items-center hover:underline"
            >
              {row.original.name}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "size",
        header: "Size (KB)",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Link
            href={`/projects/new/${installation.installationId}/${row.original.full_name}`}
            target="_blank"
          >
            <Button size="sm" variant="outline">
              Create Project
            </Button>
          </Link>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No repositories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </Button>
        </div>
      )}
    </div>
  );
};
