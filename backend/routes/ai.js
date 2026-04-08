const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/suggest-priority', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a task priority assistant. Based on the task title and description, respond with ONLY one word — either: low, medium, or high. Nothing else.'
          },
          {
            role: 'user',
            content: `Task: ${title}\nDescription: ${description || 'none'}`
          }
        ],
        max_tokens: 10
      })
    });
    const data = await response.json();
    const priority = data.choices[0].message.content.trim().toLowerCase();
    const valid = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    res.json({ priority: valid });
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

router.post('/breakdown', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a task breakdown assistant. Given a goal, break it into 3-6 clear, actionable subtasks. 
            Respond ONLY with a JSON array like this: ["subtask 1", "subtask 2", "subtask 3"]. 
            No explanation, no markdown, just the raw JSON array.`
          },
          {
            role: 'user',
            content: `Goal: ${title}\nDetails: ${description || 'none'}`
          }
        ],
        max_tokens: 300
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const subtasks = JSON.parse(content);
    res.json({ subtasks });
  } catch (err) {
    res.status(500).json({ message: 'AI breakdown error', error: err.message });
  }
});

router.post('/spending-insights', auth, async (req, res) => {
  const { finances } = req.body;
  try {
    const summary = finances.reduce((acc, f) => {
      if (f.type === 'expense') {
        acc[f.category] = (acc[f.category] || 0) + f.amount;
      }
      return acc;
    }, {});

    const summaryText = Object.entries(summary)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(', ');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a personal finance advisor. Analyze spending and give 3 short, friendly, specific insights. 
            Format as JSON array of strings like: ["insight 1", "insight 2", "insight 3"]. 
            No markdown, no explanation, just the raw JSON array.`
          },
          {
            role: 'user',
            content: `My expenses this month: ${summaryText}`
          }
        ],
        max_tokens: 300
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const insights = JSON.parse(content);
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: 'AI insights error', error: err.message });
  }
});
module.exports = router;