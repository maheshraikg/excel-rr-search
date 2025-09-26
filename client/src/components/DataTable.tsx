import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set());

  const toggleSheet = (sheetId: string) => {
    setExpandedSheets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sheetId)) {
        newSet.delete(sheetId);
      } else {
        newSet.add(sheetId);
      }
      return newSet;
    });
  };

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
            Try searching with a different RR number or check your uploaded files.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {searchResults.map((sheetData, sheetIndex) => {
        const sheetId = `${sheetData.fileName}-${sheetData.sheetName}`;
        const isExpanded = expandedSheets.has(sheetId);
        
        return (
          <Card key={sheetId} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleSheet(sheetId)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover-elevate cursor-pointer" data-testid={`header-${sheetIndex}`}>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" data-testid={`badge-matches-${sheetIndex}`}>
                        {sheetData.matchingRows.length} matches
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          {sheetData.headers.map((header, headerIndex) => (
                            <TableHead key={headerIndex} className="font-medium">
                              {header}
                            </TableHead>
                          ))}
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheetData.matchingRows.map((rowIndex) => {
                          const row = sheetData.rows[rowIndex];
                          return (
                            <TableRow 
                              key={rowIndex} 
                              className="hover:bg-muted/50"
                              data-testid={`row-${sheetIndex}-${rowIndex}`}
                            >
                              <TableCell className="font-medium text-muted-foreground">
                                {rowIndex + 1}
                              </TableCell>
                              {sheetData.headers.map((header, cellIndex) => (
                                <TableCell key={cellIndex} className="max-w-xs">
                                  <div className="truncate" title={row[header]?.toString()}>
                                    {highlightText(row[header]?.toString() || '', searchTerm)}
                                  </div>
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(JSON.stringify(row, null, 2))}
                                    data-testid={`button-copy-${sheetIndex}-${rowIndex}`}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => console.log('View details for row:', row)}
                                    data-testid={`button-details-${sheetIndex}-${rowIndex}`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {sheetData.matchingRows.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        Load More Results
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}