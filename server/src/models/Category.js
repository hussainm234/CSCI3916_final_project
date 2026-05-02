const mongoose = require('mongoose');
 
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  monthlyBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });
 
// Each user can only have one category with the same name
categorySchema.index({ name: 1, user: 1 }, { unique: true });
 
module.exports = mongoose.model('Category', categorySchema);