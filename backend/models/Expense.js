import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount must be positive']
  },
  split_among: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one user must be included']
  }],
  paid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payer must be specified']
  },
  payment_status: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending'
    },
    amount_due: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes for frequently queried fields
expenseSchema.index({ 'payment_status.status': 1 });
expenseSchema.index({ paid_by: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
