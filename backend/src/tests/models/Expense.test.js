import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Expense from "@models/Expense.js";
import User from "@models/User.js";

describe("Expense Model", () => {
  let testUser1, testUser2, householdId;

  beforeEach(async () => {
    householdId = new mongoose.Types.ObjectId();
    const timestamp = Date.now();

    testUser1 = await User.create({
      name: "Test User 1",
      email: `test1${timestamp}@example.com`,
      password: "password123",
      household_id: householdId,
    });

    testUser2 = await User.create({
      name: "Test User 2",
      email: `test2${timestamp}@example.com`,
      password: "password123",
      household_id: householdId,
    });
  });

  const validExpenseData = {
    title: "Test Expense",
    amount: 100,
    category: "groceries",
    description: "Weekly groceries",
    household_id: null, // Will be set in tests
    created_by: null, // Will be set in tests
  };

  describe("Expense Validation", () => {
    it("should create & save expense successfully", async () => {
      const expenseData = {
        ...validExpenseData,
        household_id: householdId,
        created_by: testUser1._id,
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense._id).toBeDefined();
      expect(savedExpense.title).toBe(expenseData.title);
      expect(savedExpense.amount).toBe(expenseData.amount);
      expect(savedExpense.status).toBe("pending");
    }, 10000);

    it("should fail to save expense with invalid category", async () => {
      const expenseWithInvalidCategory = new Expense({
        ...validExpenseData,
        household_id: householdId,
        created_by: testUser1._id,
        category: "invalid_category",
      });

      await expect(expenseWithInvalidCategory.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);
  });

  describe("Expense Methods", () => {
    it("should split expense equally among users", async () => {
      const expense = await Expense.create({
        ...validExpenseData,
        household_id: householdId,
        created_by: testUser1._id,
      });

      await expense.splitEqually([testUser1._id, testUser2._id]);

      expect(expense.splits).toHaveLength(2);
      expect(expense.splits[0].amount).toBe(50);
      expect(expense.splits[1].amount).toBe(50);
    }, 10000);

    it("should mark split as paid and update status", async () => {
      const expense = await Expense.create({
        ...validExpenseData,
        household_id: householdId,
        created_by: testUser1._id,
      });

      await expense.splitEqually([testUser1._id, testUser2._id]);
      await expense.markSplitAsPaid(testUser1._id);

      expect(expense.status).toBe("partially_paid");
      expect(expense.calculateTotalPaid()).toBe(50);

      await expense.markSplitAsPaid(testUser2._id);
      expect(expense.status).toBe("paid");
      expect(expense.calculateTotalPaid()).toBe(100);
    }, 10000);

    it("should set status to overdue when due date is passed", async () => {
      const expense = await Expense.create({
        ...validExpenseData,
        household_id: householdId,
        created_by: testUser1._id,
        due_date: new Date(Date.now() - 86400000), // Yesterday
      });

      await expense.updateStatus();
      expect(expense.status).toBe("overdue");
    }, 10000);
  });
});
