import mongoose from "mongoose";

const householdSchema = new mongoose.Schema(
  {
    house_code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a household name"],
      trim: true,
    },
    address: {
      street: String,
      state: String,
      zip: String,
      country: String,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      currency: {
        type: String,
        default: "USD",
      },
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Household", householdSchema);
