import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertFileSchema, insertDataSchema, searchSchema } from "@shared/schema";
import { z } from "zod";
import { loadUserData } from "./load-data";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for VPS hosting
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls files are allowed'));
    }
  }
});

// Helper function to extract RR number from row data
function extractRRNumber(rowData: Record<string, any>): string | null {
  for (const [key, value] of Object.entries(rowData)) {
    if (key.toLowerCase().includes('rr') && value) {
      const str = value.toString();
      // Look for RR pattern (RR followed by numbers)
      const rrMatch = str.match(/RR\d+/i);
      if (rrMatch) return rrMatch[0].toUpperCase();
    }
  }
  return null;
}

// Helper function to process Excel file
async function processExcelFile(fileBuffer: Buffer, fileName: string, originalName: string, mimeType: string) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheets = workbook.SheetNames;
  
  // Save file metadata
  const fileData = insertFileSchema.parse({
    fileName,
    originalName,
    fileSize: fileBuffer.length,
    mimeType,
    sheets
  });
  
  const savedFile = await storage.saveExcelFile(fileData);
  
  // Process each sheet
  const dataRows = [];
  
  for (const sheetName of sheets) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) continue;
    
    // First row as headers
    const headers = (jsonData[0] as any[]).map(h => h?.toString() || '').filter(h => h);
    
    // Process data rows (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows
      
      const rowData: Record<string, any> = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      const rrNumber = extractRRNumber(rowData);
      
      const dataRow = insertDataSchema.parse({
        fileId: savedFile.id,
        sheetName,
        rowIndex: i - 1, // Adjust for header row
        headers,
        rowData,
        rrNumber
      });
      
      dataRows.push(dataRow);
    }
  }
  
  // Save all data rows
  if (dataRows.length > 0) {
    await storage.saveExcelData(dataRows);
  }
  
  return savedFile;
}

// Track data loading status
let dataLoadingStatus = {
  isLoading: true,
  progress: 0,
  message: 'Starting data load...',
  filesLoaded: 0,
  totalFiles: 0,
  rowsLoaded: 0
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Load user's Excel data in the BACKGROUND after server starts
  // This makes the app available immediately
  loadUserData()
    .then(() => {
      dataLoadingStatus = {
        isLoading: false,
        progress: 100,
        message: 'All data loaded successfully!',
        filesLoaded: dataLoadingStatus.totalFiles,
        totalFiles: dataLoadingStatus.totalFiles,
        rowsLoaded: dataLoadingStatus.rowsLoaded
      };
      console.log('Background data loading complete!');
    })
    .catch((error) => {
      console.error('Error loading data:', error);
      dataLoadingStatus.message = 'Error loading data: ' + error.message;
    });
  
  // Add loading status endpoint
  app.get('/api/loading-status', (req, res) => {
    res.json(dataLoadingStatus);
  });
  
  // Upload Excel files
  app.post('/api/upload', upload.single('excelFile'), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Check for duplicate file name
      const existingFile = await storage.getExcelFileByName(file.originalname);
      if (existingFile) {
        return res.status(400).json({ 
          error: 'Duplicate file',
          message: `File "${file.originalname}" already exists. Please rename the file or delete the existing one first.`
        });
      }
      
      console.log('Processing uploaded file:', file.originalname);
      
      const processedFile = await processExcelFile(
        file.buffer,
        file.filename || file.originalname,
        file.originalname,
        file.mimetype
      );
      
      const rowCount = await storage.getFileRowCount(processedFile.id);
      
      res.json({ 
        message: `Successfully uploaded ${file.originalname}`,
        file: {
          ...processedFile,
          rowCount,
          sheetCount: processedFile.sheets.length
        }
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
  
  // Get all uploaded files
  app.get('/api/files', async (req, res) => {
    try {
      const files = await storage.getExcelFiles();
      res.json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });
  
  // Delete a file
  app.delete('/api/files/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getExcelFile(id);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      await storage.deleteExcelFile(id);
      res.json({ message: 'File deleted successfully' });
      
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });
  
  // Search by RR number
  app.post('/api/search', async (req, res) => {
    try {
      const filters = searchSchema.parse(req.body);
      const results = await storage.searchByRRNumber(filters);
      
      res.json({
        results,
        totalResults: results.reduce((sum, sheet) => sum + sheet.matchingRows.length, 0)
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid search parameters',
          details: error.errors 
        });
      }
      
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });
  
  // Get available sheets
  app.get('/api/sheets', async (req, res) => {
    try {
      const sheets = await storage.getAvailableSheets();
      res.json(sheets);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      res.status(500).json({ error: 'Failed to fetch sheets' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}