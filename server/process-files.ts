import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

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

// Process the attached Excel files
export async function processAttachedFiles() {
  const attachedDir = path.join(process.cwd(), 'attached_assets');
  const files = fs.readdirSync(attachedDir);
  
  const processedData = [];
  
  for (const fileName of files) {
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) continue;
    
    try {
      const filePath = path.join(attachedDir, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) continue;
        
        // First row as headers
        const headers = (jsonData[0] as any[]).map(h => h?.toString() || '').filter(h => h);
        
        const rows = [];
        // Process data rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows
          
          const rowData: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || '';
          });
          
          const rrNumber = extractRRNumber(rowData);
          
          rows.push({
            rowIndex: i - 1,
            rowData,
            rrNumber
          });
        }
        
        processedData.push({
          fileName,
          sheetName,
          headers,
          rows
        });
      }
    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
    }
  }
  
  return processedData;
}

// Run the processing
processAttachedFiles().then(data => {
  console.log('Processed data:', JSON.stringify(data, null, 2));
}).catch(error => {
  console.error('Error:', error);
});