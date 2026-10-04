import { Router, Request, Response } from 'express';
import { getSettings, updateSettings } from '../db';

const router = Router();

// GET /api/settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/settings
router.post('/settings', async (req: Request, res: Response) => {
  try {
    await updateSettings(req.body);
    const updated = await getSettings();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
