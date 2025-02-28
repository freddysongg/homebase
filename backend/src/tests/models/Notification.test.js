import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Notification from "@models/Notification.js";
import User from "@models/User.js";

describe("Notification Model", () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    const timestamp = Date.now();
    testUser1 = await User.create({
      name: "Test User 1",
      email: `test1${timestamp}@example.com`,
      password: "password123",
      household_id: new mongoose.Types.ObjectId(),
    });
    testUser2 = await User.create({
      name: "Test User 2",
      email: `test2${timestamp}@example.com`,
      password: "password123",
      household_id: new mongoose.Types.ObjectId(),
    });
  });

  const validNotificationData = {
    type: "chore_reminder",
    title: "Complete your chore",
    message: "The kitchen needs cleaning",
    recipient_ids: [], // Will be set in tests
    priority: "medium",
    delivery_methods: {
      inApp: true,
      email: false,
      push: false,
    },
  };

  describe("Notification Validation", () => {
    it("should create & save notification successfully", async () => {
      const notificationData = {
        ...validNotificationData,
        recipient_ids: [testUser1._id],
      };

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.type).toBe(notificationData.type);
      expect(savedNotification.title).toBe(notificationData.title);
      expect(savedNotification.message).toBe(notificationData.message);
      expect(savedNotification.recipient_ids[0].toString()).toBe(
        testUser1._id.toString(),
      );
      expect(savedNotification.read_status.size).toBe(0);
    }, 10000);

    it("should fail to save notification with invalid type", async () => {
      const notificationWithInvalidType = new Notification({
        ...validNotificationData,
        type: "invalid_type",
        recipient_ids: [testUser1._id],
      });

      await expect(notificationWithInvalidType.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);
  });

  describe("Notification Methods", () => {
    it("should mark notification as read for specific user", async () => {
      const notification = await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser1._id, testUser2._id],
      });

      await notification.markAsRead(testUser1._id);

      expect(notification.read_status.get(testUser1._id.toString())).toBe(true);
      expect(
        notification.read_status.get(testUser2._id.toString()),
      ).toBeUndefined();
    }, 10000);

    it("should get correct unread count for user", async () => {
      await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser1._id],
      });

      await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser1._id],
      });

      const unreadCount = await Notification.getUnreadCount(testUser1._id);
      expect(unreadCount).toBe(2);
    }, 10000);

    it("should mark all notifications as read for user", async () => {
      const notification1 = await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser1._id],
      });

      const notification2 = await Notification.create({
        ...validNotificationData,
        recipient_ids: [testUser1._id],
      });

      await Notification.markAllAsRead(testUser1._id);

      const updatedNotification1 = await Notification.findById(
        notification1._id,
      );
      const updatedNotification2 = await Notification.findById(
        notification2._id,
      );

      expect(
        updatedNotification1.read_status.get(testUser1._id.toString()),
      ).toBe(true);
      expect(
        updatedNotification2.read_status.get(testUser1._id.toString()),
      ).toBe(true);
    }, 10000);
  });
});
