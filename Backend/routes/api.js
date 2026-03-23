import express from 'express';
import axios from 'axios';
import Conversation from '../models/Conversation.js';

const router = express.Router();


// POST /api/ask-ai
// Sends prompt to OpenRouter and returns AI response
router.post('/ask-ai', async (req, res) => {
  const { prompt } = req.body;
  console.log('Received prompt:', prompt);  

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'MERN AI Flow',
        },
      }
    );

    const answer = aiResponse.data.choices[0].message.content;
    res.json({ response: answer });
  } catch (err) {
    console.error('OpenRouter error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to get AI response. Please check your OpenRouter API key.',
    });
  }
});

// POST /api/save
// Saves prompt + response to MongoDB
router.post('/save', async (req, res) => {
  const { prompt, response } = req.body;

  if (!prompt || !response) {
    return res.status(400).json({ error: 'Both prompt and response are required' });
  }

  try {
    const conversation = new Conversation({ prompt, response });
    await conversation.save();
    res.json({ message: 'Saved successfully ✓', data: conversation });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: 'Failed to save to database' });
  }
});

// GET /api/history
// Fetches last 10 saved conversations
router.get('/history', async (req, res) => {
  try {
    const history = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    console.error('History fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;