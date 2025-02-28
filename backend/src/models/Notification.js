import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "chore_reminder",
        "expense_alert",
        "task_due",
        "payment_reminder",
        "household_update",
        "system_alert",
      ],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    recipient_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    read_status: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    reference: {
      model: {
        type: String,
        enum: ["Chore", "Expense", "Task", "Household"],
        required: false,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
    },
    delivery_methods: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    scheduled_for: Date,
    expires_at: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
notificationSchema.index({ recipient_ids: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduled_for: 1 });
notificationSchema.index({ expires_at: 1 });

// Instance methods
notificationSchema.methods.markAsRead = async function (userId) {
  this.read_status.set(userId.toString(), true);
  return this.save();
};

notificationSchema.methods.markAsUnread = async function (userId) {
  this.read_status.set(userId.toString(), false);
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient_ids: userId,
    [`read_status.${userId}`]: { $ne: true },
  });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  const notifications = await this.find({ recipient_ids: userId });
  const updatePromises = notifications.map((notification) =>
    notification.markAsRead(userId),
  );
  return Promise.all(updatePromises);
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
