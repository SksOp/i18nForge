import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TranslationEntry } from "@/types/translations";

interface TranslationsTableProps {
  data: TranslationEntry[];
  fileNames: string[];
  filters?: {
    searchTerm: string;
    selectedLanguage: string;
  };
}

export function TranslationsTable({ data, fileNames }: TranslationsTableProps) {
  return (
    <Table className="table-fixed w-full">
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow>
          <TableHead className="w-[300px] bg-muted/50 font-semibold">
            Translation Key
          </TableHead>
          {fileNames.map((name) => (
            <TableHead key={name} className="min-w-[200px] font-semibold">
              {name.toUpperCase()}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((entry) => (
            <TableRow key={entry.key} className="hover:bg-muted/10">
              <TableCell
                className="font-medium truncate bg-muted/5 font-mono text-sm"
                title={entry.key}
              >
                {entry.key}
              </TableCell>
              {fileNames.map((name) => (
                <TableCell
                  key={`${entry.key}-${name}`}
                  className="truncate max-w-[200px]"
                  title={entry[name] || ""}
                >
                  <span className="line-clamp-2">
                    {entry[name] || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={fileNames.length + 1}
              className="h-24 text-center"
            >
              No translations found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
