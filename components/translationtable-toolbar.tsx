'use client';

import { useEffect, useMemo, useState } from 'react';

import { TranslationEntry } from '@/types/translations';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableFacetedFilter } from './translationTable-facetedFilter';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
  originalFileContents?: Record<string, any>; // Add this prop to access original content
}

export function DataTableToolbar<TData, TValue>({
  table,
  columns,
  data,
  setData,
  setEditedValues,
  fileNames,
  originalFileContents = {},
}: DataTableToolbarProps<TData, TValue>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [newKey, setNewKey] = useState('');
  const [languageValues, setLanguageValues] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Helper function to get nested value from original content
  const getNestedValue = (obj: any, keyPath: string): string => {
    const keys = keyPath.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return ''; // Return empty string if path doesn't exist
      }
    }

    return typeof current === 'string' ? current : '';
  };

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

    // 1. Build new entry using actual fileNames
    const newEntry: TranslationEntry = {
      key: trimmedKey,
      ...Object.fromEntries(fileNames.map((lang) => [lang, languageValues[lang] || ''])),
    };

    // 2. Add to table data
    setData((prev) => [newEntry as TData, ...prev]);

    // 3. Add to editedValues - ALL languages for new keys (even empty ones)
    const newEdits = fileNames.map((lang) => {
      const originalValue = getNestedValue(originalFileContents[lang] || {}, trimmedKey);
      return {
        key: trimmedKey,
        language: lang,
        newValue: languageValues[lang] ? languageValues[lang].trim() : '',
        originalValue, // Get original value from nested structure
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

        <Input
          placeholder="Filter tasks..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex gap-2 items-center"></div>
    </div>
  );
}
