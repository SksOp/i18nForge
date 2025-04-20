import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { TranslationEntry } from "@/types/translations";
  
  interface TranslationsTableProps {
    data: TranslationEntry[];
    fileNames: string[];
  }
  
  export function TranslationsTable({ data, fileNames }: TranslationsTableProps) {
    return (
      <Table className="table-fixed">
        <TableCaption>Translation Keys and Values</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] bg-muted/50">Translation Key</TableHead>
            {fileNames.map(name => (
              <TableHead key={name} className="w-[250px]">
                {name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.key} className="group">
              <TableCell 
                className="font-bold truncate bg-muted/10 group-hover:bg-muted/20 transition-colors"
                title={entry.key}
              >
                {entry.key}
              </TableCell>
              {fileNames.map(name => (
                <TableCell 
                  key={`${entry.key}-${name}`} 
                  className="truncate"
                  title={entry[name] || ''}
                >
                  {entry[name] || <span className="text-muted-foreground">-</span>}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }