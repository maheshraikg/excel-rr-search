import { useState } from 'react';
import { Share2, Copy, Eye, EyeOff, ChevronDown, ChevronUp, Search, FileSpreadsheet, ClipboardList, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

interface EnhancedResultsListProps {
  searchResults: SheetData[];
  searchTerm: string;
}

export default function EnhancedResultsList({ searchResults, searchTerm }: EnhancedResultsListProps) {
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text;
    
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'i');
    const parts = text.toString().split(regex);
    
    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
      return isMatch ? (
        <mark key={`highlight-${index}-${part}`} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-bold">
          {part}
        </mark>
      ) : part;
    });
  };

  const copyRecord = (row: DataRow, rrNumber: string) => {
    const recordText = Object.entries(row)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(recordText);
    toast({
      title: 'Copied to clipboard',
      description: `Record for RR ${rrNumber} copied successfully.`,
    });
  };

  const shareRecord = (row: DataRow, rrNumber: string) => {
    const recordText = Object.entries(row)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: `RR Number: ${rrNumber}`,
        text: recordText,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(recordText);
      toast({
        title: 'Copied for sharing',
        description: 'Record copied to clipboard for sharing.',
      });
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (searchResults.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
          <p className="text-muted-foreground text-center">
            Try searching with a different RR number.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Flatten all results for the list view
  const allResults = searchResults.flatMap((sheetData) => 
    sheetData.matchingRows.map((rowIndex, resultIndex) => {
      const row = sheetData.rows[rowIndex];
      const rrNumber = row['RR Number'] || row['RRNo'] || row['RR_Number'] || '';
      const cardId = `${sheetData.fileName}-${sheetData.sheetName}-${rowIndex}`;
      
      return {
        cardId,
        rrNumber: rrNumber.toString(),
        row,
        sheetData,
        rowIndex: rowIndex + 1,
        resultIndex: resultIndex + 1
      };
    })
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border">
        <div className="text-center">
          <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            {allResults.length} Records Found
          </Badge>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Found in {searchResults.length} sheet{searchResults.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {allResults.map(({ cardId, rrNumber, row, sheetData, rowIndex, resultIndex }) => {
          const isExpanded = expandedCards[cardId];
          
          // Extract primary fields for preview
          const primaryFields = ['CustomerName', 'UHID', 'District', 'Taluk', 'VillageName', 'Village Name', 'Address']
            .reduce((acc, field) => {
              if (row[field] && row[field] !== '') {
                acc[field] = row[field];
              }
              return acc;
            }, {} as Record<string, string | number>);

          return (
            <Card key={cardId} className="overflow-hidden border hover-elevate">
              <CardHeader className="pb-3 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-lg shadow-lg break-all flex items-center gap-2">
                      <Search className="w-4 h-4 flex-shrink-0" />
                      RR: {highlightText(rrNumber, searchTerm)}
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      Row {rowIndex} • {sheetData.sheetName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => shareRecord(row, rrNumber)}
                      data-testid={`button-share-${cardId}`}
                      aria-label="Share record"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyRecord(row, rrNumber)}
                      data-testid={`button-copy-${cardId}`}
                      aria-label="Copy record to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCardExpansion(cardId)}
                      data-testid={`button-expand-${cardId}`}
                      aria-label={isExpanded ? "Show less details" : "Show more details"}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span className="sr-only">Show less details</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Show more details</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-3 sm:p-6">
                {/* Primary Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {Object.entries(primaryFields).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 p-2 sm:p-3 rounded-lg">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        {key}
                      </div>
                      <div className="text-sm font-medium text-foreground break-words">
                        {highlightText(value.toString(), searchTerm)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expandable Full Details */}
                {isExpanded && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Complete Record Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(row).map(([key, value]) => (
                        <div key={key} className="text-sm border rounded-lg p-3 bg-background/50">
                          <div className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                            {key}
                          </div>
                          <div className="text-foreground">
                            {value ? (
                              highlightText(value.toString(), searchTerm)
                            ) : (
                              <span className="italic text-muted-foreground">(empty)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Source */}
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <File className="w-3 h-3 flex-shrink-0" />
                    Source: {sheetData.fileName}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => toggleCardExpansion(cardId)}
                    className="text-xs"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                    {isExpanded ? 'Show Less' : 'Show All Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}