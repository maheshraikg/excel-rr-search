import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const files = await storage.getExcelFiles();
      const filesWithCounts = await Promise.all(
        files.map(async (file) => {
          const rowCount = await storage.getFileRowCount(file.id);
          return {
            ...file,
            rowCount
          };
        })
      );
      
      res.status(200).json(filesWithCounts);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}