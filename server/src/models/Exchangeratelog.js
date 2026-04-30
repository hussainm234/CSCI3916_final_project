const mongoose = require('mongoose');

const exchangeRateLogSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  targetCurrency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


module.exports = mongoose.model('ExchangeRateLog', exchangeRateLogSchema);