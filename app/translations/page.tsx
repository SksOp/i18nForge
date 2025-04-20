import { TranslationsTable } from "@/components/ui/translations-table";
import { createTableData } from "@/utils/translation-utils";
import enTranslations from "@/constants/en.json";
import deTranslations from "@/constants/de.json";
import { Button } from "@/components/ui/button";

const FILES = {
  "en": enTranslations,
  "de": deTranslations
};

export default function TranslationsPage() {
  const fileNames = Object.keys(FILES);
  const tableData = createTableData(FILES);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Translation Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and compare translations across all languages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              Import Translations
            </Button>
            <Button>
              + Add Language
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Languages</h3>
            <p className="mt-2 text-2xl font-semibold">{fileNames.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Translation Keys</h3>
            <p className="mt-2 text-2xl font-semibold">{tableData.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
            <p className="mt-2 text-2xl font-semibold">Today</p>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search translation keys..."
                  className="pl-4 pr-4 py-2 text-sm rounded-md border bg-transparent w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
            <TranslationsTable data={tableData} fileNames={fileNames} />
          </div>
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing all {tableData.length} keys
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" disabled>
                Previous
              </Button>
              <Button variant="ghost" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}