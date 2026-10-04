import { Router, Request, Response } from 'express';
import { getAnalyticsSummary, getTelemetryLogs, getCacheEntries } from '../db';

const router = Router();

// GET /api/analytics/summary
router.get('/analytics/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await getAnalyticsSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/logs
router.get('/analytics/logs', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await getTelemetryLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/cache
router.get('/analytics/cache', async (_req: Request, res: Response) => {
  try {
    const cacheEntries = await getCacheEntries();
    res.json(cacheEntries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
