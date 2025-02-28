import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

// Set up test environment variables
process.env.JWT_SECRET = "test-jwt-secret";
process.env.NODE_ENV = "test";
process.env.VAPID_PUBLIC_KEY = "test-public-key";
process.env.VAPID_PRIVATE_KEY = "test-private-key";
process.env.VAPID_EMAIL = "test@example.com";

let mongoServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  } catch (error) {
    console.error("Error in test setup:", error);
    throw error;
  }
});

// Clear database between tests
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } catch (error) {
    console.error("Error clearing test database:", error);
    throw error;
  }
});

// Disconnect and stop mongodb after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    await mongoServer.stop();
  } catch (error) {
    console.error("Error in test teardown:", error);
    throw error;
  }
});

// Mock external dependencies
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock any other external services you might be using
jest.mock("@utils/push.js", () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true),
}));

jest.mock("@utils/email.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
