import { 
  type ExcelFile, 
  type InsertExcelFile, 
  type ExcelDataRow, 
  type InsertExcelData, 
  type SearchFilters,
  type SearchResult,
  excelFiles,
  excelData
} from "../shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql } from "drizzle-orm";

// Storage interface for Excel file operations
export interface IStorage {
  // File operations
  saveExcelFile(file: InsertExcelFile): Promise<ExcelFile>;
  getExcelFiles(): Promise<ExcelFile[]>;
  getExcelFile(id: string): Promise<ExcelFile | undefined>;
  getExcelFileByName(fileName: string): Promise<ExcelFile | undefined>;
  deleteExcelFile(id: string): Promise<void>;
  
  // Data operations
  saveExcelData(data: InsertExcelData[]): Promise<void>;
  searchByRRNumber(filters: SearchFilters): Promise<SearchResult[]>;
  getAvailableSheets(): Promise<string[]>;
  getFileRowCount(fileId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async saveExcelFile(insertFile: InsertExcelFile): Promise<ExcelFile> {
    const [file] = await db
      .insert(excelFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getExcelFiles(): Promise<ExcelFile[]> {
    return await db.select().from(excelFiles);
  }

  async getExcelFile(id: string): Promise<ExcelFile | undefined> {
    const [file] = await db.select().from(excelFiles).where(eq(excelFiles.id, id));
    return file || undefined;
  }

  async getExcelFileByName(fileName: string): Promise<ExcelFile | undefined> {
    const [file] = await db.select().from(excelFiles).where(eq(excelFiles.originalName, fileName));
    return file || undefined;
  }

  async deleteExcelFile(id: string): Promise<void> {
    // Cascade deletion will handle associated data automatically
    await db.delete(excelFiles).where(eq(excelFiles.id, id));
  }

  async saveExcelData(dataRows: InsertExcelData[]): Promise<void> {
    if (dataRows.length > 0) {
      // Insert in batches to handle large datasets efficiently
      const batchSize = 1000;
      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        await db.insert(excelData).values(batch);
      }
    }
  }

  async searchByRRNumber(filters: SearchFilters): Promise<SearchResult[]> {
    const { rrNumber, sheet } = filters;
    
    // Build WHERE clause based on filters
    let whereClause = sql`
      (${excelData.rrNumber} ILIKE ${`%${rrNumber}%`} OR 
       ${excelData.rowData}::text ILIKE ${`%${rrNumber}%`})
    `;
    
    if (sheet) {
      whereClause = and(whereClause, eq(excelData.sheetName, sheet)) ?? whereClause;
    }

    // Get matching data with file information
    const results = await db
      .select({
        data: excelData,
        file: excelFiles
      })
      .from(excelData)
      .innerJoin(excelFiles, eq(excelData.fileId, excelFiles.id))
      .where(whereClause);

    // Group results by file and sheet
    const groupedResults = new Map<string, {
      fileName: string;
      sheetName: string;
      headers: string[];
      rows: Record<string, any>[];
      matchingRows: number[];
      exactMatches: boolean[];
    }>();

    for (const { data, file } of results) {
      const key = `${file.id}-${data.sheetName}`;
      
      if (!groupedResults.has(key)) {
        groupedResults.set(key, {
          fileName: file.originalName,
          sheetName: data.sheetName,
          headers: data.headers,
          rows: [],
          matchingRows: [],
          exactMatches: []
        });
      }

      const group = groupedResults.get(key)!;
      group.rows.push(data.rowData);
      group.matchingRows.push(group.rows.length - 1);
      
      // Check if this is an exact match
      const isExactMatch = data.rrNumber?.toLowerCase() === rrNumber.toLowerCase() ||
        Object.values(data.rowData).some(value => 
          value?.toString().toLowerCase() === rrNumber.toLowerCase()
        );
      group.exactMatches.push(isExactMatch);
    }

    // Convert to SearchResult format and sort by match type
    const searchResults: SearchResult[] = Array.from(groupedResults.values()).map(group => {
      const hasExactMatch = group.exactMatches.some(match => match);
      const exactRRNumber = hasExactMatch ? 
        results.find(r => r.data.rrNumber?.toLowerCase() === rrNumber.toLowerCase())?.data.rrNumber : 
        undefined;
      
      return {
        fileName: group.fileName,
        sheetName: group.sheetName,
        headers: group.headers,
        rows: group.rows,
        matchingRows: group.matchingRows,
        matchType: hasExactMatch ? 'exact' as const : 'partial' as const,
        exactRRNumber: exactRRNumber || undefined
      };
    });

    // Sort exact matches first
    return searchResults.sort((a, b) => {
      if (a.matchType === 'exact' && b.matchType === 'partial') return -1;
      if (a.matchType === 'partial' && b.matchType === 'exact') return 1;
      return 0;
    });
  }

  async getAvailableSheets(): Promise<string[]> {
    const results = await db
      .selectDistinct({ sheetName: excelData.sheetName })
      .from(excelData);
    return results.map(r => r.sheetName);
  }

  async getFileRowCount(fileId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(excelData)
      .where(eq(excelData.fileId, fileId));
    return result.count;
  }
}

export const storage = new DatabaseStorage();