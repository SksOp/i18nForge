'use client';

import { useEffect, useMemo, useState } from 'react';

import { TranslationEntry } from '@/types/translations';
import { ColumnDef, Table } from '@tanstack/react-table';
import { AlertCircle, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableFacetedFilter } from './translationTable-facetedFilter';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EditedValue {
  key: string;
  language: string;
  newValue: string;
  originalValue: string;
}

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: React.Dispatch<React.SetStateAction<TData[]>>;
  setEditedValues: React.Dispatch<React.SetStateAction<EditedValue[]>>;
  fileNames: string[];
  originalFileContents?: Record<string, any>;
  columnVisibility?: Record<string, boolean>;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function DataTableToolbar<TData, TValue>({
  table,
  columns,
  data,
  setData,
  setEditedValues,
  fileNames,
  originalFileContents = {},
  columnVisibility = {},
  setColumnVisibility = () => {},
}: DataTableToolbarProps<TData, TValue>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [newKey, setNewKey] = useState('');
  const [languageValues, setLanguageValues] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Regex search states
  const [searchValue, setSearchValue] = useState('');
  const [isRegexMode, setIsRegexMode] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);

  // Helper function to get nested value from original content
  const getNestedValue = (obj: any, keyPath: string): string => {
    const keys = keyPath.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  };

  // Custom filter function that supports both regular string search and regex
  const customGlobalFilter = useMemo(() => {
    return (row: any, columnId: string, filterValue: string) => {
      if (!filterValue) return true;

      try {
        const entry = row.original as TranslationEntry;

        if (isRegexMode) {
          // Validate regex
          const regex = new RegExp(filterValue, 'i');
          setRegexError(null);

          // Search in key
          if (regex.test(entry.key)) return true;

          // Search in translation values
          return fileNames.some((lang) => {
            const value = entry[lang as keyof TranslationEntry];
            return typeof value === 'string' && regex.test(value);
          });
        } else {
          // Regular string search (case-insensitive)
          const searchTerm = filterValue.toLowerCase();

          // Search in key
          if (entry.key.toLowerCase().includes(searchTerm)) return true;

          // Search in translation values
          return fileNames.some((lang) => {
            const value = entry[lang as keyof TranslationEntry];
            return typeof value === 'string' && value.toLowerCase().includes(searchTerm);
          });
        }
      } catch (error) {
        // Invalid regex
        if (isRegexMode) {
          setRegexError('Invalid regex pattern');
        }
        return true; // Show row if regex is invalid
      }
    };
  }, [isRegexMode, fileNames]);

  // Update table filter when search changes
  useEffect(() => {
    if (searchValue) {
      table.setGlobalFilter(searchValue);
    } else {
      table.setGlobalFilter('');
    }
  }, [searchValue, table]);

  // Custom filter functions for the faceted filters
  const languageFilter = useMemo(() => {
    return (row: any, columnId: string, filterValues: string[]) => {
      if (!filterValues || filterValues.length === 0) return true;

      const entry = row.original as TranslationEntry;
      // Show row if any of the selected languages have content
      return filterValues.some((lang) => {
        const value = entry[lang as keyof TranslationEntry];
        return typeof value === 'string' && value.trim() !== '';
      });
    };
  }, []);

  const statusFilter = useMemo(() => {
    return (row: any, columnId: string, filterValues: string[]) => {
      if (!filterValues || filterValues.length === 0) return true;

      const entry = row.original as TranslationEntry;
      const hasMissingTranslations = fileNames.some((lang) => {
        const value = entry[lang as keyof TranslationEntry];
        return typeof value !== 'string' || value.trim() === '';
      });

      return filterValues.some((status) => {
        if (status === 'missing') return hasMissingTranslations;
        if (status === 'complete') return !hasMissingTranslations;
        return true;
      });
    };
  }, [fileNames]);

  // Set up custom column filters
  useEffect(() => {
    // Add virtual columns for filtering
    if (table.options.columns) {
      const hasLanguageColumn = table.options.columns.some((col: any) => col.id === 'languages');
      const hasStatusColumn = table.options.columns.some((col: any) => col.id === 'status');

      if (!hasLanguageColumn) {
        table.options.columns.push({
          id: 'languages',
          filterFn: languageFilter,
        });
      }

      if (!hasStatusColumn) {
        table.options.columns.push({
          id: 'status',
          filterFn: statusFilter,
        });
      }
    }
  }, [languageFilter, statusFilter, table]);

  const handleAddKey = () => {
    if (!newKey.trim()) {
      toast.error('Key name is required.');
      return;
    }

    const trimmedKey = newKey.trim();

    // Check if key already exists
    const existingKeys = (data as TranslationEntry[]).map((entry) => entry.key);
    if (existingKeys.includes(trimmedKey)) {
      toast.error('This key already exists.');
      return;
    }

    // Build new entry using actual fileNames
    const newEntry: TranslationEntry = {
      key: trimmedKey,
      ...Object.fromEntries(fileNames.map((lang) => [lang, languageValues[lang] || ''])),
    };

    // Add to table data
    setData((prev) => [newEntry as TData, ...prev]);

    // Add to editedValues - ALL languages for new keys (even empty ones)
    const newEdits = fileNames.map((lang) => {
      const originalValue = getNestedValue(originalFileContents[lang] || {}, trimmedKey);
      return {
        key: trimmedKey,
        language: lang,
        newValue: languageValues[lang] ? languageValues[lang].trim() : '',
        originalValue,
      };
    });

    setEditedValues((prev) => [...prev, ...newEdits]);

    // Reset form
    setNewKey('');
    setLanguageValues({});
    setIsDialogOpen(false);
    toast.success('New key added.');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewKey('');
    setLanguageValues({});
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setRegexError(null);
  };

  const handleRegexModeToggle = (checked: boolean) => {
    setIsRegexMode(checked);
    setRegexError(null);
  };

  const clearSearch = () => {
    setSearchValue('');
    setRegexError(null);
    table.setGlobalFilter('');
  };

  // Initialize language values when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const initialValues = Object.fromEntries(fileNames.map((lang) => [lang, '']));
      setLanguageValues(initialValues);
    }
  }, [isDialogOpen, fileNames]);

  function hasAccessorKey<TData, TValue>(
    col: ColumnDef<TData, TValue>,
  ): col is ColumnDef<TData, TValue> & { accessorKey: string } {
    return typeof (col as any).accessorKey === 'string';
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle className="text-lg font-semibold">Add New Key</DialogTitle>
            <DialogDescription className="mb-4 text-sm text-muted-foreground">
              Fill out the key and optional translations for each language. Use dot notation for
              nested keys (e.g., "common.button.save").
            </DialogDescription>

            <div className="space-y-4">
              {/* Key Name Input */}
              <div className="space-y-2">
                <Label htmlFor="keyName" className="block text-sm font-medium">
                  Key Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="keyName"
                  placeholder="Enter key (e.g., 'common.button.save')"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>

              {/* Language inputs generated from fileNames */}
              {fileNames.map((lang) => (
                <div key={lang} className="space-y-2">
                  <Label htmlFor={lang} className="block text-sm font-medium">
                    {lang.toUpperCase()}
                  </Label>
                  <Input
                    id={lang}
                    placeholder={`Enter ${lang} translation`}
                    value={languageValues[lang] || ''}
                    onChange={(e) =>
                      setLanguageValues((prev) => ({ ...prev, [lang]: e.target.value }))
                    }
                  />
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddKey} className="flex-1">
                  Add Key
                </Button>
                <Button variant="outline" onClick={handleDialogClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Search Input with Regex Support */}
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRegexMode ? 'Enter regex pattern...' : 'Filter translations...'}
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className={`h-8 w-[200px] lg:w-[300px] pl-8 ${regexError ? 'border-red-500' : ''}`}
            />
            {regexError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{regexError}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Regex Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="regex-mode"
              checked={isRegexMode}
              onCheckedChange={handleRegexModeToggle}
            />
            <Label htmlFor="regex-mode" className="text-sm font-medium">
              Regex
            </Label>
          </div>
        </div>

        <DataTableFacetedFilter
          title="Languages"
          options={fileNames.map((lang) => ({
            label: lang.toUpperCase(),
            value: lang,
          }))}
          //@ts-ignore
          column={{
            getFilterValue: () =>
              Object.entries(columnVisibility)
                .filter(([col, visible]) => col !== 'key' && visible)
                .map(([col]) => col),

            setFilterValue: (newVisibleCols: string[] | undefined) => {
              setColumnVisibility({
                key: true,
                ...Object.fromEntries(
                  fileNames.map((lang) => [
                    lang,
                    newVisibleCols ? newVisibleCols.includes(lang) : true,
                  ]),
                ),
              });
            },

            // dummy methods to match the `Column` type
            getFacetedUniqueValues: () => new Map(),
          }}
        />

        <DataTableFacetedFilter
          title="Status"
          column={table.getColumn('status')}
          options={[
            { label: 'Missing', value: 'missing' },
            { label: 'Complete', value: 'complete' },
          ]}
        />

        {(isFiltered || searchValue) && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              clearSearch();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset All Filters
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}

        {/* Search Examples Tooltip */}
        {isRegexMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  ?
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Regex Examples:</strong>
                  </p>
                  <p>
                    <code>^common\.</code> - Keys starting with "common."
                  </p>
                  <p>
                    <code>\.button\.</code> - Keys containing ".button."
                  </p>
                  <p>
                    <code>save$</code> - Keys ending with "save"
                  </p>
                  <p>
                    <code>^(auth|user)\.</code> - Keys starting with "auth." or "user."
                  </p>
                  <p>
                    <code>\.(error|success)$</code> - Keys ending with ".error" or ".success"
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex gap-2 items-center"></div>
    </div>
  );
}
