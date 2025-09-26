import { useState } from 'react';
import { FileSpreadsheet, Search, Database } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import SearchInterface from '@/components/SearchInterface';
import DataTable from '@/components/DataTable';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  sheets?: string[];
}

interface SearchFilters {
  rrNumber: string;
  sheet: string;
  dateRange: string;
}

interface DataRow {
  [key: string]: string | number;
}

interface SheetData {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: DataRow[];
  matchingRows: number[];
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [searchResults, setSearchResults] = useState<SheetData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  // Mock data for demo purposes
  const mockSheetData: SheetData[] = [
    {
      fileName: 'Caste survey 24.09.2025.xls',
      sheetName: 'Survey Data',
      headers: ['RR Number', 'Name', 'Caste', 'Age', 'Gender', 'District', 'Survey Date'],
      rows: [
        { 'RR Number': 'RR001234', 'Name': 'Rajesh Kumar', 'Caste': 'General', 'Age': 32, 'Gender': 'Male', 'District': 'Dakshina Kannada', 'Survey Date': '2024-09-15' },
        { 'RR Number': 'RR005678', 'Name': 'Priya Sharma', 'Caste': 'OBC', 'Age': 28, 'Gender': 'Female', 'District': 'Udupi', 'Survey Date': '2024-09-16' },
        { 'RR Number': 'RR009012', 'Name': 'Arun Nayak', 'Caste': 'SC', 'Age': 35, 'Gender': 'Male', 'District': 'Mangalore', 'Survey Date': '2024-09-17' }
      ],
      matchingRows: []
    },
    {
      fileName: 'LT1 INST KADABA.xlsx',
      sheetName: 'Main Data',
      headers: ['RR Number', 'Institution Name', 'Type', 'Location', 'Established', 'Students Count'],
      rows: [
        { 'RR Number': 'RR001234', 'Institution Name': 'Kadaba Primary School', 'Type': 'Primary School', 'Location': 'Kadaba', 'Established': '1985', 'Students Count': 245 },
        { 'RR Number': 'RR005678', 'Institution Name': 'Kadaba High School', 'Type': 'High School', 'Location': 'Kadaba', 'Established': '1992', 'Students Count': 412 },
        { 'RR Number': 'RR009012', 'Institution Name': 'Kadaba College', 'Type': 'College', 'Location': 'Kadaba', 'Established': '2001', 'Students Count': 892 }
      ],
      matchingRows: []
    }
  ];

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
    console.log('Files uploaded:', newFiles);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    console.log('File removed:', fileId);
  };

  const handleSearch = (filters: SearchFilters) => {
    setIsSearching(true);
    setCurrentSearchTerm(filters.rrNumber);
    console.log('Searching for:', filters);

    // Simulate search delay
    setTimeout(() => {
      // Mock search logic - find matching rows
      const results = mockSheetData.map(sheetData => {
        const matchingRows: number[] = [];
        sheetData.rows.forEach((row, index) => {
          if (row['RR Number']?.toString().toLowerCase().includes(filters.rrNumber.toLowerCase())) {
            matchingRows.push(index);
          }
        });
        return { ...sheetData, matchingRows };
      }).filter(sheet => sheet.matchingRows.length > 0);

      setSearchResults(results);
      setIsSearching(false);
      setHasSearched(true);
    }, 1000);
  };

  const availableSheets = uploadedFiles.flatMap(file => file.sheets || []);
  const totalResults = searchResults.reduce((sum, sheet) => sum + sheet.matchingRows.length, 0);

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
                  Search RR numbers across multiple sheets
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
          {/* Welcome Section */}
          {uploadedFiles.length === 0 && !hasSearched && (
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Database className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Welcome to Excel Data Search</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Upload your Excel files and search by RR number to find matching data across all sheets. 
                      Perfect for survey data, institutional records, and cross-referencing information.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Supports .xlsx & .xls
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Fast RR number search
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Multi-sheet results
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload Section */}
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={uploadedFiles}
            onFileRemove={handleFileRemove}
          />

          {/* Search Section - Only show if files are uploaded or we have mock data */}
          {(uploadedFiles.length > 0 || true) && (
            <SearchInterface
              onSearch={handleSearch}
              isSearching={isSearching}
              availableSheets={availableSheets.length > 0 ? availableSheets : ['Survey Data', 'Main Data', 'Reference']}
              totalResults={totalResults}
            />
          )}

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