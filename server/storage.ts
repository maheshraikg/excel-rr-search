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
    const results = new Map<string, SearchResult>();

    // Search through all data rows
    const dataEntries = Array.from(this.excelData.values());
    for (const data of dataEntries) {
      // Filter by sheet if specified
      if (sheet && data.sheetName !== sheet) continue;

      // Check if RR number matches
      const matchesRR = data.rrNumber?.toLowerCase().includes(rrNumber.toLowerCase()) ||
                       Object.values(data.rowData).some(value => 
                         value?.toString().toLowerCase().includes(rrNumber.toLowerCase())
                       );

      if (matchesRR) {
        const file = this.excelFiles.get(data.fileId);
        if (!file) continue;

        // Use fileId instead of fileName to avoid collisions
        const key = `${file.id}-${data.sheetName}`;
        
        if (!results.has(key)) {
          results.set(key, {
            fileName: file.originalName,
            sheetName: data.sheetName,
            headers: data.headers,
            rows: [],
            matchingRows: []
          });
        }

        const result = results.get(key)!;
        result.rows.push(data.rowData);
        result.matchingRows.push(result.rows.length - 1);
      }
    }

    return Array.from(results.values());
  }

  async getAvailableSheets(): Promise<string[]> {
    const sheets = new Set<string>();
    const dataEntries = Array.from(this.excelData.values());
    for (const data of dataEntries) {
      sheets.add(data.sheetName);
    }
    return Array.from(sheets);
  }
}

export const storage = new MemStorage();