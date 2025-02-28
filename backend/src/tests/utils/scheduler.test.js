import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { processRecurringExpenses } from "@utils/scheduler.js";
import Expense from "@models/Expense.js";
import User from "@models/User.js";
import { createNotification } from "@controllers/notification.controller.js";

// Mock the notification controller
jest.mock("@controllers/notification.controller.js");

describe("Scheduler Utils", () => {
  let testUser, householdId;

  beforeEach(async () => {
    householdId = new mongoose.Types.ObjectId();
    testUser = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      household_id: householdId,
    });
  });

  describe("processRecurringExpenses", () => {
    it("should create new expense instances for due recurring expenses", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recurringExpense = await Expense.create({
        title: "Monthly Rent",
        amount: 1000,
        category: "rent",
        household_id: householdId,
        created_by: testUser._id,
        splits: [
          {
            user_id: testUser._id,
            amount: 1000,
            paid: false,
          },
        ],
        recurring: {
          is_recurring: true,
          frequency: "monthly",
          next_due_date: yesterday,
        },
      });

      await processRecurringExpenses();

      // Check that a new expense was created
      const newExpenses = await Expense.find({
        title: "Monthly Rent",
        "recurring.is_recurring": true,
      });

      expect(newExpenses).toHaveLength(2);

      // Check that the original expense was updated
      const updatedOriginal = await Expense.findById(recurringExpense._id);
      expect(updatedOriginal.recurring.next_due_date.getTime()).toBeGreaterThan(
        yesterday.getTime(),
      );

      // Verify notification was created
      expect(createNotification).toHaveBeenCalled();
    });
  });
});
