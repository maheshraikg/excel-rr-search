import { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Database } from 'lucide-react';
import SearchInterface from '@/components/SearchInterface';
import DataTable from '@/components/DataTable';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { api, type SearchFilters, type SearchResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [files, sheets] = await Promise.all([
          api.getFiles(),
          api.getAvailableSheets()
        ]);
        setFileCount(files.length);
        setAvailableSheets(sheets);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load data from Excel sheets.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  const handleSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    setCurrentSearchTerm(filters.rrNumber);
    console.log('Searching for:', filters);

    try {
      const response = await api.search(filters);
      setSearchResults(response.results);
      setHasSearched(true);
      
      if (response.totalResults === 0) {
        toast({
          title: 'No results found',
          description: `No data found for RR number "${filters.rrNumber}".`,
        });
      } else {
        toast({
          title: 'Search completed',
          description: `Found ${response.totalResults} matching records.`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Search failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const totalResults = searchResults.reduce((sum, sheet) => sum + sheet.matchingRows.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Excel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold" data-testid="text-app-title">
                  Excel Data Search
                </h1>
                <p className="text-sm text-muted-foreground">
                  Search RR numbers across Caste Survey & Institution data
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Data Overview */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Data Loaded & Ready</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your Excel data has been loaded. Search by RR number to find matching records 
                    from both the Caste Survey and Institution datasets.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    {fileCount} Excel files loaded
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {availableSheets.length} sheets available
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Ready to search
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <SearchInterface
            onSearch={handleSearch}
            isSearching={isSearching}
            availableSheets={availableSheets}
            totalResults={totalResults}
          />

          {/* Results Section */}
          {hasSearched && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Results for "{currentSearchTerm}"
              </h2>
              <DataTable 
                searchResults={searchResults}
                searchTerm={currentSearchTerm}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}