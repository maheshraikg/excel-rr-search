import { 
  type ExcelFile, 
  type InsertExcelFile, 
  type ExcelDataRow, 
  type InsertExcelData, 
  type SearchFilters,
  type SearchResult 
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for Excel file operations
export interface IStorage {
  // File operations
  saveExcelFile(file: InsertExcelFile): Promise<ExcelFile>;
  getExcelFiles(): Promise<ExcelFile[]>;
  getExcelFile(id: string): Promise<ExcelFile | undefined>;
  deleteExcelFile(id: string): Promise<void>;
  
  // Data operations
  saveExcelData(data: InsertExcelData[]): Promise<void>;
  searchByRRNumber(filters: SearchFilters): Promise<SearchResult[]>;
  getAvailableSheets(): Promise<string[]>;
  getFileRowCount(fileId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private excelFiles: Map<string, ExcelFile>;
  private excelData: Map<string, ExcelDataRow>;

  constructor() {
    this.excelFiles = new Map();
    this.excelData = new Map();
  }

  async saveExcelFile(insertFile: InsertExcelFile): Promise<ExcelFile> {
    const id = randomUUID();
    const file: ExcelFile = {
      ...insertFile,
      id,
      uploadDate: new Date(),
      sheets: insertFile.sheets ? [...insertFile.sheets] : [],
    };
    this.excelFiles.set(id, file);
    return file;
  }

  async getExcelFiles(): Promise<ExcelFile[]> {
    return Array.from(this.excelFiles.values());
  }

  async getExcelFile(id: string): Promise<ExcelFile | undefined> {
    return this.excelFiles.get(id);
  }

  async deleteExcelFile(id: string): Promise<void> {
    this.excelFiles.delete(id);
    // Also delete associated data
    const dataEntries = Array.from(this.excelData.entries());
    for (const [dataId, data] of dataEntries) {
      if (data.fileId === id) {
        this.excelData.delete(dataId);
      }
    }
  }

  async saveExcelData(dataRows: InsertExcelData[]): Promise<void> {
    for (const row of dataRows) {
      const id = randomUUID();
      const dataRow: ExcelDataRow = { 
        ...row, 
        id,
        headers: [...row.headers],
        rrNumber: row.rrNumber || null
      };
      this.excelData.set(id, dataRow);
    }
  }

  async searchByRRNumber(filters: SearchFilters): Promise<SearchResult[]> {
    const { rrNumber, sheet } = filters;
    const exactMatches = new Map<string, SearchResult>();
    const partialMatches = new Map<string, SearchResult>();

    // Search through all data rows
    const dataEntries = Array.from(this.excelData.values());
    for (const data of dataEntries) {
      // Filter by sheet if specified
      if (sheet && data.sheetName !== sheet) continue;

      // Check for exact match first
      let isExactMatch = false;
      let matchedRRNumber = '';
      
      if (data.rrNumber?.toLowerCase() === rrNumber.toLowerCase()) {
        isExactMatch = true;
        matchedRRNumber = data.rrNumber;
      } else {
        // Check for exact match in any field
        for (const [key, value] of Object.entries(data.rowData)) {
          if (value?.toString().toLowerCase() === rrNumber.toLowerCase()) {
            isExactMatch = true;
            matchedRRNumber = value.toString();
            break;
          }
        }
      }

      // If not exact match, check for partial match
      let isPartialMatch = false;
      if (!isExactMatch) {
        isPartialMatch = data.rrNumber?.toLowerCase().includes(rrNumber.toLowerCase()) ||
                        Object.values(data.rowData).some(value => 
                          value?.toString().toLowerCase().includes(rrNumber.toLowerCase())
                        );
      }

      if (isExactMatch || isPartialMatch) {
        const file = this.excelFiles.get(data.fileId);
        if (!file) continue;

        // Use different maps for exact vs partial matches
        const resultsMap = isExactMatch ? exactMatches : partialMatches;
        const matchType = isExactMatch ? 'exact' : 'partial';
        
        // Use fileId instead of fileName to avoid collisions
        const key = `${file.id}-${data.sheetName}`;
        
        if (!resultsMap.has(key)) {
          resultsMap.set(key, {
            fileName: file.originalName,
            sheetName: data.sheetName,
            headers: data.headers,
            rows: [],
            matchingRows: [],
            matchType: matchType as 'exact' | 'partial',
            exactRRNumber: isExactMatch ? matchedRRNumber : undefined
          });
        }

        const result = resultsMap.get(key)!;
        result.rows.push(data.rowData);
        result.matchingRows.push(result.rows.length - 1);
      }
    }

    // Return exact matches first, then partial matches
    const exactResults = Array.from(exactMatches.values());
    const partialResults = Array.from(partialMatches.values());
    
    return [...exactResults, ...partialResults];
  }

  async getAvailableSheets(): Promise<string[]> {
    const sheets = new Set<string>();
    const dataEntries = Array.from(this.excelData.values());
    for (const data of dataEntries) {
      sheets.add(data.sheetName);
    }
    return Array.from(sheets);
  }

  async getFileRowCount(fileId: string): Promise<number> {
    const dataEntries = Array.from(this.excelData.values());
    return dataEntries.filter(data => data.fileId === fileId).length;
  }
}

export const storage = new MemStorage();