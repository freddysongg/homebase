import mongoose from 'mongoose';

const householdTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  assigned_to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one user must be assigned']
  }]
}, {
  timestamps: true
});

// Indexes for frequently queried fields
householdTaskSchema.index({ deadline: 1 });
householdTaskSchema.index({ status: 1 });

const HouseholdTask = mongoose.model('HouseholdTask', householdTaskSchema);

export default HouseholdTask;
