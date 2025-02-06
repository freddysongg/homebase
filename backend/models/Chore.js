import mongoose from 'mongoose';

const choreSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  assigned_to: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    required: [true, 'At least one user must be assigned'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one user must be assigned'
    }
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'pending'
  },
  rotation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for frequently queried fields
choreSchema.index({ due_date: 1 });
choreSchema.index({ status: 1 });

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;
