import { jest } from "@jest/globals";
import mongoose from "mongoose";
import PushSubscription from "../../models/PushSubscription.js";
import User from "../../models/User.js";

describe("PushSubscription Model", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      household_id: new mongoose.Types.ObjectId(),
    });
  });

  const validSubscriptionData = {
    user_id: null, // Will be set in tests
    endpoint: "https://fcm.googleapis.com/fcm/send/123",
    keys: {
      p256dh: "test-p256dh-key",
      auth: "test-auth-key",
    },
    browser: "Chrome",
    device: "Desktop",
  };

  describe("PushSubscription Validation", () => {
    it("should create & save subscription successfully", async () => {
      const subscriptionData = {
        ...validSubscriptionData,
        user_id: testUser._id,
      };

      const subscription = new PushSubscription(subscriptionData);
      const savedSubscription = await subscription.save();

      expect(savedSubscription._id).toBeDefined();
      expect(savedSubscription.endpoint).toBe(subscriptionData.endpoint);
      expect(savedSubscription.keys.p256dh).toBe(subscriptionData.keys.p256dh);
      expect(savedSubscription.keys.auth).toBe(subscriptionData.keys.auth);
      expect(savedSubscription.browser).toBe(subscriptionData.browser);
      expect(savedSubscription.device).toBe(subscriptionData.device);
    }, 10000);

    it("should fail to save subscription without required fields", async () => {
      const subscription = new PushSubscription({
        user_id: testUser._id,
      });

      await expect(subscription.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);

    it("should fail to save duplicate endpoint", async () => {
      const subscriptionData = {
        ...validSubscriptionData,
        user_id: testUser._id,
      };

      await PushSubscription.create(subscriptionData);

      const duplicateSubscription = new PushSubscription(subscriptionData);
      await expect(duplicateSubscription.save()).rejects.toThrow(
        mongoose.Error.MongoError,
      );
    }, 10000);
  });
});
