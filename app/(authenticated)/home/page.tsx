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
import {
  User,
  Plus,
  Globe,
  ExternalLink,
  Loader,
  Search,
  Lock,
} from "lucide-react";
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
import Layout from "@/layout/layout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/spinner";

const URL_FOR_INSTALL = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

export default function HomePage() {
  const { data, isLoading } = useSuspenseQuery(installationsQuery());
  const [selectedInstallation, setSelectedInstallation] = useState<string>(
    data[0]?.id
  );
  const [searchQuery, setSearchQuery] = useState("");
  console.log("data", data);
  const installation = data?.find(
    (installation) => installation.id === selectedInstallation
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const filteredRepos = data.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout className="container mx-auto mt-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Let's build something new</h1>
        <p className="text-muted-foreground">
          Select a Git repository to get started with your new project
        </p>
      </div>
      <Separator className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh]">
        <Card className="shadow-sm max-h-[60vh] overflow-y-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Import Git Repository
              </h2>
              <Select
                value={selectedInstallation}
                onValueChange={(v) => {
                  if (v === "install") {
                    window.open(URL_FOR_INSTALL ?? "#", "_blank");
                  } else {
                    setSelectedInstallation(v);
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select a Git provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data?.map((installation) => (
                      <SelectItem key={installation.id} value={installation.id}>
                        <div className="flex items-center">
                          {installation.type === "Organization" ? (
                            <Globe className="mr-2 h-4 w-4" />
                          ) : (
                            <User className="mr-2 h-4 w-4" />
                          )}
                          {installation.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectItem value="install">
                    <Plus className="mr-2 h-4 w-4" />
                    Install GitHub App
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data && data.length > 0 ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {installation && <RepoList installation={installation} />}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 bg-primary/10 p-4 rounded-full">
                  <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    asChild
                  >
                    <Link
                      href={URL_FOR_INSTALL ?? "#"}
                      className="flex items-center justify-center"
                    >
                      <Plus className="h-6 w-6" />
                    </Link>
                  </Button>
                </div>
                <h3 className="text-lg font-medium mb-2">Connect to GitHub</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Authorize GitHub to import your repositories and set up
                  automatic deployments
                </p>
                <Button asChild>
                  <Link href={URL_FOR_INSTALL ?? "#"}>Install GitHub App</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm max-h-[60vh] overflow-y-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Clone Template</h2>
            <p className="text-muted-foreground mb-4">
              Get started quickly with a template from our marketplace
            </p>
            <Button variant="outline" asChild>
              <Link href="#">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* <div className="flex items-center justify-between mb-6">
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

      {installation && <RepoList installation={installation} />} */}
    </Layout>
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
  console.log("table", installation, flatData);
  return (
    <div className="border rounded-md divide-y ">
      {flatData.length > 0 ? (
        flatData.map((repo) => (
          <div
            key={repo.id}
            className="p-4 flex items-center justify-between hover:bg-muted/50"
          >
            <div className="flex gap-2 items-center">
              <span className="font-medium">{repo.name}</span>
              {repo.private && <Lock className="w-4 h-4" />}
            </div>
            <Link
              href={`/projects/new/${installation.installationId}/${repo.full_name}`}
            >
              <Button size="sm">Import</Button>
            </Link>
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No repositories found matching your search.
        </div>
      )}
    </div>
  );
};

// export const RepoList = ({ installation }: { installation: Installation }) => {
//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounce(search, 500);

//   const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
//     useInfiniteQuery({
//       ...installationRepositoriesQuery(installation.installationId, {
//         per_page: 10,
//         search: debouncedSearch,
//       }),
//       getNextPageParam: (lastPage, pages) => {
//         return lastPage.length === 10 ? pages.length + 1 : null;
//       },
//     });

//   const flatData = useMemo(
//     () => data?.pages.flatMap((page) => page) ?? [],
//     [data?.pages]
//   );

//   const table = useReactTable({
//     data: flatData,
//     columns: [
//       {
//         accessorKey: "name",
//         header: "Name",
//         cell: ({ row }) => (
//           <div className="flex items-center gap-2">
//             <Link
//               href={row.original.html_url}
//               target="_blank"
//               className="flex items-center hover:underline"
//             >
//               {row.original.name}
//               <ExternalLink className="ml-2 h-4 w-4" />
//             </Link>
//           </div>
//         ),
//       },
//       {
//         accessorKey: "size",
//         header: "Size (KB)",
//       },
//       {
//         accessorKey: "created_at",
//         header: "Created At",
//         cell: ({ row }) =>
//           new Date(row.original.created_at).toLocaleDateString(),
//       },
//       {
//         id: "actions",
//         cell: ({ row }) => (
//           <Link
//             href={`/projects/new/${installation.installationId}/${row.original.full_name}`}
//           >
//             <Button size="sm" variant="outline">
//               Create Project
//             </Button>
//           </Link>
//         ),
//       },
//     ],
//     getCoreRowModel: getCoreRowModel(),
//   });
//   console.log("table", installation, flatData);
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2">
//         <Input
//           placeholder="Search repositories..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="max-w-sm"
//         />
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center p-4">
//           <Loader className="animate-spin" />
//         </div>
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={4} className="h-24 text-center">
//                     No repositories found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//       {hasNextPage && (
//         <div className="flex justify-center mt-4">
//           <Button
//             onClick={() => fetchNextPage()}
//             disabled={!hasNextPage || isFetchingNextPage}
//           >
//             {isFetchingNextPage
//               ? "Loading more..."
//               : hasNextPage
//               ? "Load More"
//               : "Nothing more to load"}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };
