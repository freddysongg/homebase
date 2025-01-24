import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    reminder_times: [{
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Please use 12-hour format (e.g., "8:00 AM")']
    }]
  },
  chore_history: [{
    chore_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chore'
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'pending'
    }
  }],
  expense_contributions: [{
    expense_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    },
    amount_paid: {
      type: Number,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Index for notifications preference
userSchema.index({ 'preferences.notifications': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
