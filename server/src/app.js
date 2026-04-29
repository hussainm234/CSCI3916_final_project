const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');

const app = express();

app.use(cors());
app.use(express.json());

// Note: DB connection is handled in `server/src/server.js` to centralize startup.
// Avoid connecting here to prevent double connections and env var mismatches.

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Budget Tracker API is running' });
});

module.exports = app;