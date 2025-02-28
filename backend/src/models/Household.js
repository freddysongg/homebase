import mongoose from "mongoose";

const householdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Household name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Household = mongoose.model("Household", householdSchema);

export default Household;
