import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Expense from "@models/Expense.js";
import User from "@models/User.js";

describe("Expense Model", () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    const timestamp = Date.now();
    testUser1 = await User.create({
      name: "Test User 1",
      email: `test1${timestamp}@example.com`,
      password: "password123",
    });
    testUser2 = await User.create({
      name: "Test User 2",
      email: `test2${timestamp}@example.com`,
      password: "password123",
    });
  });

  const validExpenseData = {
    description: "Groceries",
    total_amount: 100.0,
    paid_by: null, // Will be set in tests
    split_among: [], // Will be set in tests
    status: "pending",
  };

  describe("Expense Validation", () => {
    it("should create an expense successfully", async () => {
      const expenseData = {
        ...validExpenseData,
        paid_by: testUser1._id,
        split_among: [
          {
            user: testUser1._id,
            amount: 50.0,
          },
          {
            user: testUser2._id,
            amount: 50.0,
          },
        ],
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense._id).toBeDefined();
      expect(savedExpense.description).toBe(expenseData.description);
      expect(savedExpense.total_amount).toBe(expenseData.total_amount);
      expect(savedExpense.paid_by.toString()).toBe(testUser1._id.toString());
      expect(savedExpense.split_among).toHaveLength(2);
    });

    it("should fail when total amount is negative", async () => {
      const expenseData = {
        ...validExpenseData,
        total_amount: -50.0,
        paid_by: testUser1._id,
        split_among: [
          {
            user: testUser1._id,
            amount: -25.0,
          },
          {
            user: testUser2._id,
            amount: -25.0,
          },
        ],
      };

      const expense = new Expense(expenseData);

      await expect(expense.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });
  });
});
