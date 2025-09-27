import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { searchSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const filters = searchSchema.parse(req.body);
      const results = await storage.searchByRRNumber(filters);
      
      res.status(200).json({
        results,
        totalResults: results.reduce((sum, result) => sum + result.matchingRows.length, 0)
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
      } else {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Failed to search data' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}