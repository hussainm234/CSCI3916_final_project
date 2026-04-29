const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, homeCurrency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({ email, password, homeCurrency: homeCurrency || 'USD' });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        homeCurrency: user.homeCurrency,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        homeCurrency: user.homeCurrency,
      },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current logged in user
router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    homeCurrency: req.user.homeCurrency,
  });
});

// PUT /api/auth/me — update home currency
router.put('/me', protect, async (req, res) => {
  try {
    const { homeCurrency } = req.body;
    req.user.homeCurrency = homeCurrency || req.user.homeCurrency;
    await req.user.save();
    res.json({
      id: req.user._id,
      email: req.user.email,
      homeCurrency: req.user.homeCurrency,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;