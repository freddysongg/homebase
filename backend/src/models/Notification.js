import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["chore reminder", "expense update", "household task", "general"],
  },
  message: {
    type: String,
    required: true,
  },
  recipient_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read_status: {
    type: Boolean,
    default: false,
  },
});

// Add markAsRead method to the schema
notificationSchema.methods.markAsRead = function () {
  this.read_status = true;
};

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
