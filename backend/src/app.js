import express from "express";
import cors from "cors";
import userRoutes from "@routes/user.routes.js";
import notificationRoutes from "@routes/notification.routes.js";
import pushSubscriptionRoutes from "@routes/pushSubscription.routes.js";
import expenseRoutes from "@routes/expense.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/push-subscriptions", pushSubscriptionRoutes);
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
