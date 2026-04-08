const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

router.get('/streak', auth, async (req, res) => {
  const { Task } = require('../models/Task');
  try {
    const tasks = await require('../models/Task').findAll({
      where: { userId: req.user.id, status: 'completed' },
      order: [['updatedAt', 'DESC']]
    });

    const uniqueDays = [...new Set(tasks.map((t) =>
      new Date(t.updatedAt).toISOString().split('T')[0]
    ))].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
      return res.json({ streak: 0 });
    }

    for (let i = 0; i < uniqueDays.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (uniqueDays[i] === expected) streak++;
      else break;
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});
module.exports = router;