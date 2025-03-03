import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import choreRoutes from "./routes/chore.routes.js";
import houseRoutes from "./routes/house.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "HomeBase API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/chores", choreRoutes);
app.use("/api/houses", houseRoutes);

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
