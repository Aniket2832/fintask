const Finance = require('../models/Finance');

exports.getFinances = async (req, res) => {
  try {
    const finances = await Finance.findAll({ where: { userId: req.user.id }, order: [['date', 'DESC']] });
    res.json(finances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createFinance = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const finance = await Finance.create({ userId: req.user.id, type, amount, category, description, date });
    res.status(201).json(finance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateFinance = async (req, res) => {
  try {
    const finance = await Finance.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!finance) return res.status(404).json({ message: 'Entry not found' });
    await finance.update(req.body);
    res.json(finance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteFinance = async (req, res) => {
  try {
    const finance = await Finance.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!finance) return res.status(404).json({ message: 'Entry not found' });
    await finance.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};