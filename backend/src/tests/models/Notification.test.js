import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Notification from "@models/Notification.js";
import User from "@models/User.js";

describe("Notification Model", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
    });
  });

  const validNotificationData = {
    type: "chore reminder",
    message: "Your chore is due tomorrow",
    recipient_ids: [], // Will be set in tests
    timestamp: new Date(),
    read_status: false,
  };

  describe("Notification Validation", () => {
    it("should create a notification successfully", async () => {
      const notificationData = {
        ...validNotificationData,
        recipient_ids: [testUser._id],
      };

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.type).toBe(notificationData.type);
      expect(savedNotification.message).toBe(notificationData.message);
      expect(savedNotification.recipient_ids[0].toString()).toBe(
        testUser._id.toString(),
      );
      expect(savedNotification.read_status).toBe(false);
    });

    it("should fail when required fields are missing", async () => {
      const notification = new Notification({});

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });

    it("should fail with invalid notification type", async () => {
      const notificationData = {
        ...validNotificationData,
        type: "invalid_type",
        recipient_ids: [testUser._id],
      };

      const notification = new Notification(notificationData);

      await expect(notification.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });
  });

  describe("Notification Methods", () => {
    it("should mark notification as read", async () => {
      const notification = await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser._id],
      });

      expect(notification.read_status).toBe(false);

      notification.markAsRead();
      await notification.save();

      expect(notification.read_status).toBe(true);
    });
  });
});
