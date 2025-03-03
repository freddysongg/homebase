import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import { processRecurringExpenses } from "./utils/scheduler.js";

// Load environment variables
dotenv.config();

// Connect to database
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

export default server;
