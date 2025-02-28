import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

let mongod;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
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
    await mongod.stop();
  } catch (error) {
    console.error("Error in test teardown:", error);
    throw error;
  }
});

// Set up global test environment
global.__MONGO_URI__ = mongod?.getUri();
