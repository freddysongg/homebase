import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import Expense from "../../models/Expense.js";

describe("Notification Model", () => {
  let testUser, testExpense;

  beforeEach(async () => {
    const householdId = new mongoose.Types.ObjectId();
    testUser = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      household_id: householdId,
    });

    testExpense = await Expense.create({
      title: "Test Expense",
      amount: 100,
      category: "groceries",
      household_id: householdId,
      created_by: testUser._id,
    });
  });

  describe("Notification Validation", () => {
    it("should create & save notification successfully", async () => {
      const validNotification = {
        type: "expense_created",
        title: "New Expense",
        message: "A new expense has been created",
        recipient_ids: [testUser._id],
        reference: {
          model: "Expense",
          id: testExpense._id,
        },
      };

      const notification = new Notification(validNotification);
      const savedNotification = await notification.save();

      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.status).toBe("unread");
      expect(savedNotification.type).toBe(validNotification.type);
    });

    it("should fail to save notification with invalid type", async () => {
      const invalidNotification = {
        type: "invalid_type",
        title: "Test",
        message: "Test message",
        recipient_ids: [testUser._id],
        reference: {
          model: "Expense",
          id: testExpense._id,
        },
      };

      await expect(Notification.create(invalidNotification)).rejects.toThrow();
    });
  });

  describe("Notification Methods", () => {
    let notification;

    beforeEach(async () => {
      notification = await Notification.create({
        type: "expense_created",
        title: "Test Notification",
        message: "Test message",
        recipient_ids: [testUser._id],
        reference: {
          model: "Expense",
          id: testExpense._id,
        },
      });
    });

    it("should mark notification as read", async () => {
      expect(notification.status).toBe("unread");

      notification.status = "read";
      await notification.save();

      const updatedNotification = await Notification.findById(notification._id);
      expect(updatedNotification.status).toBe("read");
    });

    it("should get unread notifications for user", async () => {
      const unreadCount = await Notification.countDocuments({
        recipient_ids: testUser._id,
        status: "unread",
      });

      expect(unreadCount).toBe(1);
    });

    it("should mark all notifications as read for user", async () => {
      await Notification.updateMany(
        { recipient_ids: testUser._id },
        { status: "read" },
      );

      const unreadCount = await Notification.countDocuments({
        recipient_ids: testUser._id,
        status: "unread",
      });

      expect(unreadCount).toBe(0);
    });
  });
});
