import { jest } from "@jest/globals";
import mongoose from "mongoose";
import HouseholdTask from "../../models/HouseholdTask.js";
import User from "../../models/User.js";

describe("HouseholdTask Model", () => {
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

  const validTaskData = {
    name: "Fix Sink",
    description: "Test Description",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    assigned_to: null, // Will be set in tests
    household_id: null, // Will be set in tests
    status: "pending",
  };

  it("should create a household task successfully", async () => {
    const taskData = {
      ...validTaskData,
      assigned_to: testUser._id,
      household_id: householdId,
    };

    const task = new HouseholdTask(taskData);
    const savedTask = await task.save();

    expect(savedTask._id).toBeDefined();
    expect(savedTask.name).toBe(taskData.name);
    expect(savedTask.status).toBe("pending");
  });

  it("should fail when required fields are missing", async () => {
    const task = new HouseholdTask({});
    await expect(task.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should fail when deadline is in the past", async () => {
    const taskData = {
      ...validTaskData,
      assigned_to: testUser._id,
      household_id: householdId,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    };

    const task = new HouseholdTask(taskData);
    await expect(task.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
