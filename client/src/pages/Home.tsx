import { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Database, Upload } from 'lucide-react';
import SearchInterface from '@/components/SearchInterface';
import EnhancedResultsList from '@/components/EnhancedResultsList';
import FileManagement from '@/components/FileManagement';
import ThemeToggle from '@/components/ThemeToggle';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import AppDownload from '@/components/AppDownload';
import SocialMediaSharing from '@/components/SocialMediaSharing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, type SearchFilters, type SearchResult } from '@/lib/api';
import type { ExcelFile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFileManagement, setShowFileManagement] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ExcelFile[]>([]);
  const { toast } = useToast();

  // Load initial data
  const loadInitialData = async () => {
    try {
      const [files, sheets] = await Promise.all([
        api.getFiles(),
        api.getAvailableSheets()
      ]);
      setFileCount(files.length);
      setUploadedFiles(files.map(file => ({ ...file, uploadDate: new Date(file.uploadDate) })));
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

  useEffect(() => {
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate" data-testid="text-app-title">
                  Excel Data Search
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Search RR numbers across uploaded Excel files
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <SocialShare className="hidden lg:flex" />
              <Button
                variant={showFileManagement ? "default" : "default"}
                onClick={() => setShowFileManagement(!showFileManagement)}
                data-testid="button-toggle-file-management"
                className={`text-xs sm:text-sm font-bold shadow-lg ${!showFileManagement ? 'animate-pulse bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90' : ''}`}
              >
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{showFileManagement ? 'Back to Search' : 'Upload Files'}</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-8">
          {showFileManagement ? (
            <>
              {/* File Management Section */}
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                  File Management
                </h2>
                <FileManagement 
                  files={uploadedFiles}
                  onFilesChanged={loadInitialData}
                />
              </div>
            </>
          ) : (
            <>
              {/* Data Overview */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Database className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Data Loaded & Ready</h2>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                        Your Excel data has been loaded. Search by RR number to find matching records 
                        from uploaded Excel files.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-muted-foreground pt-4">
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
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="break-all">Search Results for "{currentSearchTerm}"</span>
                  </h2>
                  <EnhancedResultsList 
                    searchResults={searchResults}
                    searchTerm={currentSearchTerm}
                  />
                </div>
              )}

              {/* App Download Section - Always visible */}
              <AppDownload />

              {/* Social Media Sharing Section - Show after search */}
              {hasSearched && <SocialMediaSharing />}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}