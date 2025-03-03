import { jest } from "@jest/globals";
import mongoose from "mongoose";
import User from "../../models/User.js";

describe("User Model Test", () => {
  const validUserData = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    household_id: new mongoose.Types.ObjectId(),
    role: "member",
    preferences: {
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
      theme: "system",
    },
  };

  describe("User Validation", () => {
    it("should create & save user successfully", async () => {
      const validUser = new User(validUserData);
      const savedUser = await validUser.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(validUserData.name);
      expect(savedUser.email).toBe(validUserData.email);
      expect(savedUser.password).not.toBe(validUserData.password);
      expect(savedUser.role).toBe("member");
      expect(savedUser.isEmailVerified).toBe(false);
      expect(savedUser.preferences.theme).toBe("system");
    }, 10000);

    it("should fail to save user without required fields", async () => {
      const userWithoutRequiredField = new User({ name: "test" });

      await expect(userWithoutRequiredField.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);

    it("should fail to save user with invalid email", async () => {
      const userWithInvalidEmail = new User({
        ...validUserData,
        email: "invalid-email",
      });

      await expect(userWithInvalidEmail.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);

    it("should fail to save user with password less than 8 characters", async () => {
      const userWithShortPassword = new User({
        ...validUserData,
        password: "short",
      });

      await expect(userWithShortPassword.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);

    it("should fail to save user with invalid role", async () => {
      const userWithInvalidRole = new User({
        ...validUserData,
        role: "invalid_role",
      });

      await expect(userWithInvalidRole.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);

    it("should fail to save user with invalid theme", async () => {
      const userWithInvalidTheme = new User({
        ...validUserData,
        preferences: {
          ...validUserData.preferences,
          theme: "invalid_theme",
        },
      });

      await expect(userWithInvalidTheme.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    }, 10000);
  });

  describe("User Methods", () => {
    it("should correctly compare passwords", async () => {
      const user = new User(validUserData);
      await user.save();

      const isMatch = await user.comparePassword(validUserData.password);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword("wrongpassword");
      expect(isNotMatch).toBe(false);
    }, 10000);

    it("should update lastActive timestamp", async () => {
      const user = new User(validUserData);
      await user.save();

      const oldLastActive = user.lastActive;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await user.updateLastActive();

      expect(user.lastActive).not.toEqual(oldLastActive);
    }, 10000);
  });

  describe("User Middleware", () => {
    it("should hash password before saving", async () => {
      const user = new User(validUserData);
      await user.save();

      expect(user.password).not.toBe(validUserData.password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
    }, 10000);
  });
});
