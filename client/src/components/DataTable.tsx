import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  type ColumnPinningState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { FileText, ChevronDown, ChevronRight, Copy, Eye, EyeOff, Settings, Check, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
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

interface DataTableProps {
  searchResults: SheetData[];
  searchTerm: string;
}

interface FlattenedRow {
  id: string;
  rrNumber: string;
  sheetName: string;
  fileName: string;
  rowIndex: number;
  data: DataRow;
  primaryFields: { [key: string]: string | number };
}

export default function DataTable({ searchResults, searchTerm }: DataTableProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [expandedSheets, setExpandedSheets] = useState<Record<string, boolean>>({});
  const [compactView, setCompactView] = useState(true);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select', 'expander', 'rrNumber'],
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Flatten all results into a single table format
  const flattenedData = useMemo(() => {
    const data: FlattenedRow[] = [];
    
    searchResults.forEach((sheetData) => {
      sheetData.matchingRows.forEach((rowIndex) => {
        const row = sheetData.rows[rowIndex];
        const rrNumber = row['RR Number'] || row['RRNo'] || row['RR_Number'] || '';
        
        // Extract key fields for the compact view
        const primaryFields: { [key: string]: string | number } = {};
        const keyFields = ['RR Number', 'RRNo', 'CustomerName', 'UHID', 'District', 'Taluk', 'VillageName', 'Village Name'];
        
        keyFields.forEach(field => {
          if (row[field] !== undefined && row[field] !== '') {
            primaryFields[field] = row[field];
          }
        });

        data.push({
          id: `${sheetData.fileName}-${sheetData.sheetName}-${rowIndex}`,
          rrNumber: rrNumber.toString(),
          sheetName: sheetData.sheetName,
          fileName: sheetData.fileName,
          rowIndex: rowIndex + 1,
          data: row,
          primaryFields
        });
      });
    });
    
    return data;
  }, [searchResults]);

  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text;
    
    // Escape special regex characters to prevent errors
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.toString().split(regex);
    
    return parts.map((part, index) => {
      // Use non-stateful comparison instead of regex.test to avoid global flag issues
      const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
      return isMatch ? (
        <mark key={`highlight-${index}-${part}`} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part;
    });
  };

  const copyToClipboard = (row: FlattenedRow) => {
    const recordText = Object.entries(row.data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(recordText);
    toast({
      title: 'Copied to clipboard',
      description: `Record for RR ${row.rrNumber} copied successfully.`,
    });
  };

  const columns = useMemo<ColumnDef<FlattenedRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          data-testid="checkbox-select-all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          data-testid={`checkbox-select-${row.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: 'expander',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={row.getToggleExpandedHandler()}
          className="p-1"
          data-testid={`button-expand-${row.id}`}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'rrNumber',
      header: 'RR Number',
      cell: ({ getValue }) => (
        <div className="font-mono font-medium text-primary">
          {highlightText(getValue() as string, searchTerm)}
        </div>
      ),
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: 'fileName',
      header: 'Source File',
      cell: ({ getValue }) => (
        <div className="text-sm text-muted-foreground truncate max-w-32">
          {getValue() as string}
        </div>
      ),
      size: 140,
      enableSorting: true,
    },
    {
      accessorKey: 'sheetName',
      header: 'Sheet',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">
          {getValue() as string}
        </Badge>
      ),
      size: 100,
      enableSorting: true,
    },
    {
      id: 'primaryInfo',
      header: 'Key Information',
      cell: ({ row }) => {
        const fields = row.original.primaryFields;
        const entries = Object.entries(fields).slice(0, compactView ? 2 : 4);
        
        return (
          <div className="space-y-1">
            {entries.map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-muted-foreground">{key}: </span>
                <span className="text-foreground">
                  {highlightText(value.toString(), searchTerm)}
                </span>
              </div>
            ))}
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'rowIndex',
      header: 'Row #',
      cell: ({ getValue }) => (
        <div className="text-xs text-muted-foreground">
          #{getValue() as number}
        </div>
      ),
      size: 60,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(row.original)}
          data-testid={`button-copy-${row.id}`}
        >
          <Copy className="w-3 h-3" />
        </Button>
      ),
      size: 60,
    },
  ], [searchTerm, compactView]);

  const table = useReactTable({
    data: flattenedData,
    columns,
    state: {
      sorting,
      expanded,
      columnPinning,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableRowSelection: true,
  });

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

  // Group results by sheet for the grouped view
  const groupedResults = useMemo(() => {
    const groups: Record<string, SheetData> = {};
    searchResults.forEach((sheet) => {
      const key = `${sheet.fileName} - ${sheet.sheetName}`;
      groups[key] = sheet;
    });
    return groups;
  }, [searchResults]);

  return (
    <div className="space-y-6">
      {/* Results Toolbar */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {flattenedData.length} records found
          </Badge>
          <Badge variant="outline" className="text-sm">
            {searchResults.length} sheets
          </Badge>
          {Object.keys(rowSelection).length > 0 && (
            <Badge variant="default" className="text-sm">
              {Object.keys(rowSelection).length} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(rowSelection).length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows;
                  const combinedText = selectedRows
                    .map(row => Object.entries(row.original.data)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n'))
                    .join('\n\n---\n\n');
                  navigator.clipboard.writeText(combinedText);
                  toast({
                    title: 'Copied to clipboard',
                    description: `${selectedRows.length} records copied successfully.`,
                  });
                }}
                data-testid="button-copy-selected"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Selected ({Object.keys(rowSelection).length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRowSelection({})}
                data-testid="button-clear-selection"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-column-settings">
                <Settings className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.columnDef.header as string || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCompactView(!compactView)}
            data-testid="button-toggle-view"
          >
            {compactView ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {compactView ? 'Detailed View' : 'Compact View'}
          </Button>
        </div>
      </div>

      {/* Unified Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Search Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className={`bg-background border-b ${
                          header.column.getIsPinned() === 'left' 
                            ? 'sticky left-0 z-20 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' 
                            : ''
                        }`}
                        style={{ 
                          width: header.getSize(),
                          left: header.column.getIsPinned() === 'left' ? `${header.column.getStart('left')}px` : undefined
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:bg-muted/50 p-2 -m-2 rounded flex items-center gap-1'
                                : 'flex items-center gap-1'
                            }
                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <span className="text-muted-foreground">
                                {{
                                  asc: '↑',
                                  desc: '↓',
                                }[header.column.getIsSorted() as string] ?? '↕'}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <>
                    <TableRow 
                      key={row.id} 
                      className="hover:bg-muted/50"
                      data-testid={`table-row-${row.id}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id} 
                          className={`py-3 ${
                            cell.column.getIsPinned() === 'left'
                              ? 'sticky left-0 z-10 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
                              : ''
                          }`}
                          style={{
                            left: cell.column.getIsPinned() === 'left' ? `${cell.column.getStart('left')}px` : undefined
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell colSpan={columns.length} className="bg-muted/20">
                          <div className="p-4 space-y-3">
                            <h4 className="font-medium text-sm">Complete Record Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Object.entries(row.original.data).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-muted-foreground">{key}:</span>
                                  <div className="text-foreground mt-1">
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
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet-by-Sheet Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Results by Sheet</h3>
        {Object.entries(groupedResults).map(([sheetKey, sheetData]) => {
          const isExpanded = expandedSheets[sheetKey] ?? false;
          
          return (
            <Collapsible 
              key={sheetKey}
              open={isExpanded}
              onOpenChange={(open) => setExpandedSheets(prev => ({ ...prev, [sheetKey]: open }))}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="hover:bg-muted/50 cursor-pointer">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-base">{sheetData.fileName}</p>
                          <p className="text-sm text-muted-foreground font-normal">
                            Sheet: {sheetData.sheetName}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {sheetData.matchingRows.length} matches
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      Click to view detailed breakdown by sheet
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}