'use client';

import { TranslationsTable } from "@/components/ui/translations-table";
import { createTableData } from "@/utils/translation-utils";
import enTranslations from "@/constants/en.json";
import deTranslations from "@/constants/de.json";
import { Button } from "@/components/ui/button";
import Layout from "@/layout/layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useCallback } from "react";

const FILES = {
  "en": enTranslations,
  "de": deTranslations
};

export default function TranslationsPage() {
  const fileNames = Object.keys(FILES);
  const tableData = useMemo(() => createTableData(FILES), [FILES]);
  
  const [searchInput, setSearchInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    selectedLanguage: 'all'
  });

  const filteredCount = useMemo(() => {
    if (!activeFilters.searchTerm && activeFilters.selectedLanguage === 'all') {
      return tableData.length;
    }
    
    return tableData.filter(entry => {
      const matchesSearch = !activeFilters.searchTerm || 
        entry.key.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()) || 
        fileNames.some(lang => 
          entry[lang]?.toString().toLowerCase().includes(activeFilters.searchTerm.toLowerCase())
        );
      
      const matchesLanguage = activeFilters.selectedLanguage === 'all' || 
        (entry[activeFilters.selectedLanguage] && entry[activeFilters.selectedLanguage] !== '');
      
      return matchesSearch && matchesLanguage;
    }).length;
  }, [tableData, activeFilters, fileNames]);

  // Stable callback for search
  const handleSearch = useCallback(() => {
    setActiveFilters({
      searchTerm: searchInput,
      selectedLanguage
    });
  }, [searchInput, selectedLanguage]);

  // Stable callback for reset
  const resetFilters = useCallback(() => {
    setSearchInput('');
    setSelectedLanguage('all');
    setActiveFilters({
      searchTerm: '',
      selectedLanguage: 'all'
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  return (
    <Layout className="gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Translation Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and compare translations across all languages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Import Translations
          </Button>
          <Button size="sm">
            + Add Language
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search keys or values..."
            value={searchInput}
            onChange={handleInputChange}
            className="pl-3 pr-8"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        
        <Select 
          value={selectedLanguage} 
          onValueChange={setSelectedLanguage}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {fileNames.map(lang => (
              <SelectItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSearch}
        >
          Search
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          disabled={!activeFilters.searchTerm && activeFilters.selectedLanguage === 'all'}
        >
          Reset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-medium text-muted-foreground">Total Keys</h3>
          <p className="mt-1 text-xl font-semibold">{tableData.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-medium text-muted-foreground">Filtered Keys</h3>
          <p className="mt-1 text-xl font-semibold">{filteredCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-medium text-muted-foreground">Languages</h3>
          <p className="mt-1 text-xl font-semibold">{fileNames.length}</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <TranslationsTable 
          data={tableData} 
          fileNames={fileNames}
          filters={activeFilters}
        />
      </div>
    </Layout>
  );
}