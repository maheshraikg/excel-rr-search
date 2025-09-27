import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const sheets = await storage.getAvailableSheets();
      res.status(200).json(sheets);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      res.status(500).json({ error: 'Failed to fetch sheets' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}