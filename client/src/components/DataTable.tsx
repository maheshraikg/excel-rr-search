import { FileText, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface DataTableProps {
  searchResults: SheetData[];
  searchTerm: string;
}

export default function DataTable({ searchResults, searchTerm }: DataTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.toString().split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (searchResults.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
          <p className="text-muted-foreground text-center">
            Try searching with a different RR number.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {searchResults.map((sheetData, sheetIndex) => (
        <Card key={`${sheetData.fileName}-${sheetData.sheetName}`} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="text-base">{sheetData.fileName}</p>
                  <p className="text-sm text-muted-foreground font-normal">
                    Sheet: {sheetData.sheetName}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" data-testid={`badge-matches-${sheetIndex}`}>
                {sheetData.matchingRows.length} matches
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {sheetData.matchingRows.map((rowIndex) => {
                const row = sheetData.rows[rowIndex];
                return (
                  <div 
                    key={rowIndex} 
                    className="border rounded-lg p-4 bg-muted/30"
                    data-testid={`result-${sheetIndex}-${rowIndex}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Record #{rowIndex + 1}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const recordText = Object.entries(row)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n');
                          copyToClipboard(recordText);
                        }}
                        data-testid={`button-copy-${sheetIndex}-${rowIndex}`}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="grid gap-3">
                      {sheetData.headers.map((header, headerIndex) => {
                        const value = row[header];
                        return (
                          <div key={headerIndex} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <div className="font-medium text-sm min-w-0 sm:min-w-[200px] text-foreground">
                              {header}:
                            </div>
                            <div className="text-sm text-muted-foreground break-words flex-1">
                              {value ? (
                                <span className="text-foreground">
                                  {highlightText(value.toString(), searchTerm)}
                                </span>
                              ) : (
                                <span className="italic text-muted-foreground">
                                  (empty)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}