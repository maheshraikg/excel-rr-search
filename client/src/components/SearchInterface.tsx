import { useState } from 'react';
import { Search, Filter, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFilters {
  rrNumber: string;
  sheet: string;
  dateRange: string;
}

interface SearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  isSearching: boolean;
  availableSheets: string[];
  totalResults: number;
}

export default function SearchInterface({ 
  onSearch, 
  isSearching, 
  availableSheets,
  totalResults 
}: SearchInterfaceProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    rrNumber: '',
    sheet: '',
    dateRange: ''
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([
    'RR001234', 'RR005678', 'RR009012' // Mock search history
  ]);

  const handleSearch = () => {
    if (!filters.rrNumber.trim()) return;
    
    console.log('Searching with filters:', filters);
    onSearch(filters);
    
    // Add to search history
    if (!searchHistory.includes(filters.rrNumber)) {
      setSearchHistory(prev => [filters.rrNumber, ...prev.slice(0, 4)]);
    }
  };

  const handleReset = () => {
    setFilters({
      rrNumber: '',
      sheet: '',
      dateRange: ''
    });
    console.log('Search filters reset');
  };

  const handleQuickSearch = (rrNumber: string) => {
    setFilters(prev => ({ ...prev, rrNumber }));
    onSearch({ ...filters, rrNumber });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search RR Numbers
          </div>
          {totalResults > 0 && (
            <Badge variant="secondary" data-testid="text-results-count">
              {totalResults} results found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter RR Number (e.g., RR001234)"
              value={filters.rrNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, rrNumber: e.target.value }))}
              onKeyPress={handleKeyPress}
              data-testid="input-rr-number"
              className="text-base"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !filters.rrNumber.trim()}
            data-testid="button-search"
          >
            {isSearching ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          <Select 
            value={filters.sheet || "all"} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, sheet: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-40" data-testid="select-sheet">
              <SelectValue placeholder="All Sheets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sheets</SelectItem>
              {availableSheets.map((sheet) => (
                <SelectItem key={sheet} value={sheet}>
                  {sheet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.dateRange || "any"} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value === "any" ? "" : value }))}
          >
            <SelectTrigger className="w-40" data-testid="select-date-range">
              <SelectValue placeholder="Any Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {totalResults > 0 && (
            <Button 
              variant="outline"
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Recent Searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((rrNumber, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSearch(rrNumber)}
                  className="h-7 px-2 text-xs"
                  data-testid={`button-history-${index}`}
                >
                  {rrNumber}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}