import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['chore reminder', 'expense due', 'task reminder', 'general']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  recipient_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one recipient is required']
  }],
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now
  },
  read_status: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for frequently queried fields
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'recipient_ids': 1 });
notificationSchema.index({ timestamp: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
