const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const protect = require('../middleware/auth');

// All routes below are protected
router.use(protect);

// GET /api/categories — get all categories for logged in user
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories — create a new category
router.post('/', async (req, res) => {
  try {
    const { name, monthlyBudget } = req.body;
    const category = await Category.create({ name, monthlyBudget, user: req.user._id });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id — update a category (only if it belongs to user)
router.put('/:id', async (req, res) => {
  try {
    const { name, monthlyBudget } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, monthlyBudget },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — delete a category (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;