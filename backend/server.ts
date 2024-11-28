import express from 'express';
import MeditationsAI from './index';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const app = express();
const port = 3001;

app.use(express.json());

const meditationsAI = new MeditationsAI();

app.post('/api/ask', async (req, res) => {
  try {
    await meditationsAI.initialize();
    const { question } = req.body;
    const response = await meditationsAI.query(question);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});