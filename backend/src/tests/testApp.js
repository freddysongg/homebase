import express from "express";
import cors from "cors";
import expenseRoutes from "@routes/expense.routes.js";
import { protect } from "@middleware/auth.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware for protected routes
app.use("/api/expenses", protect);

// Routes
app.use("/api/expenses", expenseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export { app };
