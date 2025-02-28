import mongoose from "mongoose";

const choreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Chore name is required"],
      trim: true,
    },
    description: String,
    assigned_to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Assigned user is required"],
      },
    ],
    household_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Household ID is required"],
    },
    due_date: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (date) {
          return date > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    rotation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for frequently queried fields
choreSchema.index({ due_date: 1 });
choreSchema.index({ status: 1 });

const Chore = mongoose.model("Chore", choreSchema);

export default Chore;
