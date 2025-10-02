import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Excel files uploaded by users
export const excelFiles = pgTable("excel_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadDate: timestamp("upload_date").notNull().default(sql`now()`),
  sheets: json("sheets").$type<string[]>().notNull().default([]),
});

// Data rows extracted from Excel sheets
export const excelData = pgTable("excel_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: varchar("file_id").notNull().references(() => excelFiles.id, { onDelete: "cascade" }),
  sheetName: text("sheet_name").notNull(),
  rowIndex: integer("row_index").notNull(),
  headers: json("headers").$type<string[]>().notNull(),
  rowData: json("row_data").$type<Record<string, any>>().notNull(),
  rrNumber: text("rr_number"), // Extracted RR number for fast searching
});

// Schema for file upload
export const insertFileSchema = createInsertSchema(excelFiles).omit({
  id: true,
  uploadDate: true,
});

// Schema for data insertion
export const insertDataSchema = createInsertSchema(excelData).omit({
  id: true,
});

// Search filter schema
export const searchSchema = z.object({
  rrNumber: z.string().min(1, "Search term is required"),
  sheet: z.string().optional(),
  dateRange: z.string().optional(),
});

// Types
export type ExcelFile = typeof excelFiles.$inferSelect;
export type InsertExcelFile = z.infer<typeof insertFileSchema>;
export type ExcelDataRow = typeof excelData.$inferSelect;
export type InsertExcelData = z.infer<typeof insertDataSchema>;
export type SearchFilters = z.infer<typeof searchSchema>;

// Search result type
export type SearchResult = {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  matchingRows: number[];
  matchType: 'exact' | 'partial'; // Type of match for prioritization
  exactRRNumber?: string; // The exact RR number that was matched
};