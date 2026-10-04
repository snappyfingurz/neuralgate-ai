import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import proxyRouter from './routes/proxy';
import analyticsRouter from './routes/analytics';
import settingsRouter from './routes/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LLM-Optimization-Gateway', timestamp: new Date().toISOString() });
});

// API Routes
app.use(proxyRouter);
app.use('/api', analyticsRouter);
app.use('/api', settingsRouter);

// Initialize DB and Start Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 LLM Cost-Optimization Gateway Server running on port ${PORT}`);
      console.log(`👉 OpenAI Proxy Endpoint: http://localhost:${PORT}/v1/chat/completions`);
      console.log(`👉 Analytics & Settings: http://localhost:${PORT}/api/analytics/summary`);
      console.log(`=======================================================`);
    });
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });
