import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    browser: String,
    device: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
    last_used: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
pushSubscriptionSchema.index({ user_id: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

const PushSubscription = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema,
);

export default PushSubscription;
