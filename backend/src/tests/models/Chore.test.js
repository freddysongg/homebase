import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Chore from "@models/Chore.js";
import User from "@models/User.js";

describe("Chore Model", () => {
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

  const validChoreData = {
    name: "Clean Kitchen",
    description: "Clean the kitchen",
    assigned_to: [], // Will be set in tests
    due_date: new Date(Date.now() + 86400000), // Tomorrow
    status: "pending",
    rotation: false,
    household_id: null, // Will be set in tests
  };

  describe("Chore Validation", () => {
    it("should create a chore successfully", async () => {
      const choreData = {
        ...validChoreData,
        assigned_to: [testUser._id],
        household_id: householdId,
      };

      const chore = new Chore(choreData);
      const savedChore = await chore.save();

      expect(savedChore._id).toBeDefined();
      expect(savedChore.name).toBe(choreData.name);
      expect(savedChore.status).toBe("pending");
    });

    it("should fail when required fields are missing", async () => {
      const chore = new Chore({});

      await expect(chore.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });

    it("should fail when due date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const choreData = {
        ...validChoreData,
        assigned_to: [testUser._id],
        due_date: pastDate,
      };

      const chore = new Chore(choreData);

      await expect(chore.save()).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });
  });
});
