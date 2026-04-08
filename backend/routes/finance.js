const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getFinances, createFinance, updateFinance, deleteFinance } = require('../controllers/financeController');

router.get('/', auth, getFinances);
router.post('/', auth, createFinance);
router.put('/:id', auth, updateFinance);
router.delete('/:id', auth, deleteFinance);

module.exports = router;