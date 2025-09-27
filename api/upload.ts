import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { storage } from '../server/storage';
import { insertFileSchema, insertDataSchema } from '../shared/schema';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for reliable serverless processing
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
      
      // Create row data object
      const rowData: Record<string, any> = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      // Extract RR number for fast searching
      const rrNumber = extractRRNumber(rowData);
      
      const dataRow = insertDataSchema.parse({
        fileId: savedFile.id,
        sheetName,
        rowIndex: i,
        headers,
        rowData,
        rrNumber
      });
      
      dataRows.push(dataRow);
    }
  }
  
  // Save all data rows
  await storage.saveExcelData(dataRows);
  
  return {
    file: savedFile,
    rowCount: dataRows.length
  };
}

// Wrapper to handle multer in serverless environment
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const fileName = `${file.originalname.split('.')[0]}_${timestamp}.${file.originalname.split('.').pop()}`;
    
    const result = await processExcelFile(
      file.buffer,
      fileName,
      file.originalname,
      file.mimetype
    );
    
    res.status(200).json({
      message: 'File uploaded and processed successfully',
      file: result.file,
      rowCount: result.rowCount
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}