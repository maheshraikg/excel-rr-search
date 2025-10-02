import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { storage } from './storage';

// Helper function to extract RR number from row data
function extractRRNumber(rowData: Record<string, any>): string | null {
  for (const [key, value] of Object.entries(rowData)) {
    if (key.toLowerCase().includes('rr') && value) {
      const str = value.toString().trim();
      // Return the actual RR number value, not just regex match
      return str || null;
    }
  }
  return null;
}

// Load the user's Excel files into the application
export async function loadUserData() {
  const attachedDir = path.join(process.cwd(), 'attached_assets');
  
  // Check if directory exists
  if (!fs.existsSync(attachedDir)) {
    console.log('No attached_assets directory found - skipping data load');
    return;
  }
  
  const files = fs.readdirSync(attachedDir);
  const excelFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
  
  console.log(`Loading user data... (${excelFiles.length} files found)`);
  
  for (const fileName of files) {
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) continue;
    
    try {
      const filePath = path.join(attachedDir, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Save file metadata
      const savedFile = await storage.saveExcelFile({
        fileName: fileName,
        originalName: fileName,
        fileSize: fileBuffer.length,
        mimeType: fileName.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/vnd.ms-excel',
        sheets: workbook.SheetNames
      });
      
      console.log(`Saved file: ${fileName} with ID: ${savedFile.id}`);
      
      // Process each sheet
      const dataRows = [];
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) continue;
        
        // First row as headers
        const headers = (jsonData[0] as any[]).map(h => h?.toString() || '').filter(h => h);
        console.log(`Processing sheet "${sheetName}" with headers:`, headers);
        
        // Process data rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows
          
          const rowData: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || '';
          });
          
          const rrNumber = extractRRNumber(rowData);
          
          const dataRow = {
            fileId: savedFile.id,
            sheetName,
            rowIndex: i - 1,
            headers,
            rowData,
            rrNumber
          };
          
          dataRows.push(dataRow);
        }
      }
      
      // Save all data rows
      if (dataRows.length > 0) {
        await storage.saveExcelData(dataRows);
        console.log(`Saved ${dataRows.length} data rows for ${fileName}`);
      }
      
    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
    }
  }
  
  console.log('User data loaded successfully!');
}