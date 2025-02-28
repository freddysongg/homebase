import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";

export const connectDB = async () => {
  // Skip connection if we're in test environment (handled by setup.js)
  if (isTest) return;

  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("MongoDB disconnection error:", error.message);
    throw error;
  }
};
