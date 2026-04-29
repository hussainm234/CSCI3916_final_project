const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  originalCurrency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  convertedAmount: {
    type: Number,
    required: true,
  },
  exchangeRateUsed: {
    type: Number,
    required: true,
  },
  homeCurrency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);