const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

router.get('/', auth, async (req, res) => {
  const budgets = await Budget.findAll({ where: { userId: req.user.id } });
  res.json(budgets);
});

router.post('/', auth, async (req, res) => {
  const { category, limit } = req.body;
  const existing = await Budget.findOne({ where: { userId: req.user.id, category } });
  if (existing) {
    await existing.update({ limit });
    return res.json(existing);
  }
  const budget = await Budget.create({ userId: req.user.id, category, limit });
  res.status(201).json(budget);
});

router.delete('/:id', auth, async (req, res) => {
  const budget = await Budget.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!budget) return res.status(404).json({ message: 'Not found' });
  await budget.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;