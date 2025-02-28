import mongoose from "mongoose";
import HouseholdTask from "@models/HouseholdTask.js";
import User from "@models/User.js";

describe("HouseholdTask Model", () => {
  let testUser;

  beforeEach(async () => {
    await Promise.all([
      mongoose.connection.collection("householdtasks").deleteMany({}),
      mongoose.connection.collection("users").deleteMany({}),
    ]);

    const timestamp = Date.now() + Math.floor(Math.random() * 1000);
    testUser = await User.create({
      name: "Test User",
      email: `test${timestamp}@example.com`,
      password: "password123",
    });
  });

  test("should create a household task successfully", async () => {
    const taskData = {
      name: "Fix leaky faucet",
      deadline: new Date(Date.now() + 86400000), // Tomorrow
      status: "in-progress",
      assigned_to: [testUser._id],
    };

    const task = new HouseholdTask(taskData);
    const savedTask = await task.save();

    expect(savedTask._id).toBeDefined();
    expect(savedTask.name).toBe(taskData.name);
    expect(savedTask.status).toBe(taskData.status);
    expect(savedTask.assigned_to[0].toString()).toBe(testUser._id.toString());
  });

  test("should fail when required fields are missing", async () => {
    const task = new HouseholdTask({});

    let err;
    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
    expect(err.errors.deadline).toBeDefined();
    expect(err.errors.assigned_to).toBeDefined();
  });

  test("should fail when deadline is in the past", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday

    const taskData = {
      name: "Past Task",
      deadline: pastDate,
      status: "pending",
      assigned_to: [testUser._id],
    };

    const task = new HouseholdTask(taskData);

    let err;
    try {
      await task.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.deadline).toBeDefined();
    expect(err.errors.deadline.message).toBe("Deadline must be in the future");
  });
});
