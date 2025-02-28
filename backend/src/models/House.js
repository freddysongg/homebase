import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense", // References the Expense model
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References the User model
      },
    ],
    chores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chore", // References the Chore model
      },
    ],
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

const House = mongoose.model("House", houseSchema);

export default House;
