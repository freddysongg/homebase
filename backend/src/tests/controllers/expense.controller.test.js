import { jest } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../testApp.js";
import User from "@models/User.js";
import Expense from "@models/Expense.js";
import jwt from "jsonwebtoken";
import { createNotification } from "@controllers/notification.controller.js";

// Mock the notification controller
jest.mock("@controllers/notification.controller.js");

describe("Expense Controller", () => {
  let testUser1, testUser2, authToken, householdId;

  beforeEach(async () => {
    householdId = new mongoose.Types.ObjectId();
    testUser1 = await User.create({
      name: "Test User 1",
      email: `test1${Date.now()}@example.com`,
      password: "password123",
      household_id: householdId,
    });

    testUser2 = await User.create({
      name: "Test User 2",
      email: `test2${Date.now()}@example.com`,
      password: "password123",
      household_id: householdId,
    });

    authToken = jwt.sign(
      { id: testUser1._id },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1d" },
    );
  });

  describe("POST /api/expenses", () => {
    it("should create a new expense", async () => {
      const expenseData = {
        title: "Test Expense",
        amount: 100,
        category: "groceries",
        description: "Weekly groceries",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        splits: [
          {
            user_id: testUser1._id.toString(),
            amount: 50,
          },
          {
            user_id: testUser2._id.toString(),
            amount: 50,
          },
        ],
      };

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expenseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(expenseData.title);
      expect(res.body.data.splits).toHaveLength(2);

      // Verify notifications were created
      expect(createNotification).toHaveBeenCalledTimes(2);
    });

    it("should create a recurring expense", async () => {
      const expenseData = {
        title: "Monthly Rent",
        amount: 1000,
        category: "rent",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Future date
        splits: [
          {
            user_id: testUser1._id,
            amount: 500,
          },
          {
            user_id: testUser2._id,
            amount: 500,
          },
        ],
        recurring: {
          is_recurring: true,
          frequency: "monthly",
          next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      };

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expenseData);

      expect(res.status).toBe(201);
      expect(res.body.data.recurring.is_recurring).toBe(true);
      expect(res.body.data.recurring.frequency).toBe("monthly");
    }, 10000);
  });

  describe("GET /api/expenses", () => {
    beforeEach(async () => {
      await Expense.create([
        {
          title: "Groceries",
          amount: 100,
          category: "groceries",
          household_id: householdId,
          created_by: testUser1._id,
          status: "pending",
        },
        {
          title: "Utilities",
          amount: 200,
          category: "utilities",
          household_id: householdId,
          created_by: testUser1._id,
          status: "paid",
        },
      ]);
    });

    it("should get all household expenses", async () => {
      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    }, 10000);

    it("should filter expenses by status", async () => {
      const res = await request(app)
        .get("/api/expenses?status=pending")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("pending");
    }, 10000);
  });

  describe("POST /api/expenses/:id/mark-paid", () => {
    it("should mark user's split as paid", async () => {
      const expense = await Expense.create({
        title: "Test Expense",
        amount: 100,
        category: "groceries",
        household_id: householdId,
        created_by: testUser1._id,
      });

      await expense.splitEqually([testUser1._id, testUser2._id]);

      const res = await request(app)
        .post(`/api/expenses/${expense._id}/mark-paid`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("partially_paid");

      const split = res.body.data.splits.find(
        (s) => s.user_id.toString() === testUser1._id.toString(),
      );
      expect(split.paid).toBe(true);
    }, 10000);
  });
});
