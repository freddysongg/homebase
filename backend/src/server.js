import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import { createUser, getUsers, getUser } from "./controllers/userController.js";
import {
  createChore,
  deleteChore,
  getChore,
  getChores,
  updateChore,
} from "./controllers/choreController.js";
import { loginUser } from "./controllers/loginController.js";
import {
  createHouse,
  deleteHouse,
  getHouse,
  updateHouse,
} from "./controllers/houseController.js";
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "./controllers/expenseController.js";
import userRoutes from "@routes/user.routes.js";
import notificationRoutes from "@routes/notification.routes.js";
import pushSubscriptionRoutes from "@routes/pushSubscription.routes.js";
import expenseRoutes from "@routes/expense.routes.js";
import { processRecurringExpenses } from "@utils/scheduler.js";

// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Schedule recurring expense processing
const SCHEDULER_INTERVAL =
  process.env.NODE_ENV === "production"
    ? 24 * 60 * 60 * 1000 // Daily in production
    : 5 * 60 * 1000; // Every 5 minutes in development

setInterval(async () => {
  console.log("Processing recurring expenses...");
  await processRecurringExpenses();
}, SCHEDULER_INTERVAL);

// Routes

//login
app.post("/api/login", loginUser);

//house
app.post("/api/house", createHouse);
app.get("/api/house/:id", getHouse);
app.put("/api/house/:id", updateHouse);
app.delete("/api/house/:id", deleteHouse);

//user
app.post("/api/users", createUser);
app.get("/api/users", getUsers);
app.get("/api/users/:id", getUser);

//chore
app.post("api/chores", createChore);
app.get("api/chores", getChores);
app.get("api/chores/:id", getChore);
app.put("api/chores/:id", updateChore);
app.delete("api/chores/:id", deleteChore);

//expenses
app.post("api/expense", createExpense);
app.get("api/expense", getExpenses);
app.get("api/expense/:id", getExpense);
app.put("api/expense/:id", updateExpense);
app.delete("api/expense/:id", deleteExpense);

//user routes
app.use("/api/users", userRoutes);

//notification routes
app.use("/api/notifications", notificationRoutes);

//push subscription routes
app.use("/api/push-subscriptions", pushSubscriptionRoutes);

//expense routes
app.use("/api/expenses", expenseRoutes);

// Basic route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "HomeBase API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server with port fallback
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle port in use error
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const altPort = PORT + 1;
    console.log(`Port ${PORT} is in use, trying port ${altPort}...`);
    app.listen(altPort, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${altPort}`,
      );
    });
  } else {
    console.error("Server error:", error);
  }
});
