import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "expense_created",
        "expense_alert",
        "chore_assigned",
        "task_assigned",
      ],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    recipient_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Recipient ID is required"],
      },
    ],
    reference: {
      model: {
        type: String,
        required: [true, "Reference model is required"],
        enum: ["Expense", "Chore", "HouseholdTask"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Reference ID is required"],
      },
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for frequently queried fields
notificationSchema.index({ recipient_ids: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
