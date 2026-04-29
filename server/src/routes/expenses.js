const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const ExchangeRateLog = require('../models/ExchangeRateLog');
const protect = require('../middleware/auth');
require('dotenv').config();

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

// Helper: get exchange rate (checks cache first, then calls API)
async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;

  // Check cache
  const cached = await ExchangeRateLog.findOne({
    baseCurrency: fromCurrency,
    targetCurrency: toCurrency,
    timestamp: { $gte: new Date(Date.now() - CACHE_DURATION_MS) },
  }).sort({ timestamp: -1 });

  if (cached) return cached.rate;

  // Call ExchangeRate-API
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.result !== 'success') {
    throw new Error(`Exchange rate API error: ${data['error-type']}`);
  }

  const rate = data.conversion_rate;

  // Save to cache
  await ExchangeRateLog.create({
    baseCurrency: fromCurrency,
    targetCurrency: toCurrency,
    rate,
  });

  return rate;
}

// All routes below are protected
router.use(protect);

// POST /api/expenses — create a new expense
router.post('/', async (req, res) => {
  try {
    const { amount, currency, categoryId, note, date } = req.body;
    const homeCurrency = req.user.homeCurrency;

    // Make sure category belongs to this user
    const category = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const rate = await getExchangeRate(currency.toUpperCase(), homeCurrency);
    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    const expense = await Expense.create({
      amount,
      originalCurrency: currency.toUpperCase(),
      convertedAmount,
      exchangeRateUsed: rate,
      homeCurrency,
      category: categoryId,
      note: note || '',
      date: date || Date.now(),
      user: req.user._id,
    });

    await expense.populate('category');
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/expenses — get all expenses for logged in user
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .populate('category')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/report — monthly spending vs budget per category for logged in user
router.get('/report', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const categories = await Category.find({ user: req.user._id });

    const report = await Promise.all(categories.map(async (cat) => {
      const expenses = await Expense.find({
        user: req.user._id,
        category: cat._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const totalSpent = expenses.reduce((sum, e) => sum + e.convertedAmount, 0);
      const budget = cat.monthlyBudget;
      const percentUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

      return {
        category: cat.name,
        categoryId: cat._id,
        budget,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        percentUsed: parseFloat(percentUsed.toFixed(1)),
        overBudget: totalSpent > budget,
        warning: percentUsed >= 80 && totalSpent <= budget,
      };
    }));

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/convert — preview conversion before submitting
router.get('/convert', async (req, res) => {
  try {
    const { amount, from } = req.query;
    const to = req.user.homeCurrency;

    if (!amount || !from) {
      return res.status(400).json({ error: 'amount and from are required' });
    }

    const rate = await getExchangeRate(from.toUpperCase(), to);
    const converted = parseFloat((parseFloat(amount) * rate).toFixed(2));

    res.json({ amount: parseFloat(amount), from: from.toUpperCase(), to, rate, converted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id — delete an expense (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;