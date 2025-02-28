import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

let mongod;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error in test setup:", error);
    throw error;
  }
}, 10000); // Increase timeout to 10 seconds

// Clear database between tests
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({}); // Add empty filter object
    }
  } catch (error) {
    console.error("Error clearing test database:", error);
    throw error;
  }
});

// Disconnect and stop mongodb after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    await mongod.stop();
  } catch (error) {
    console.error("Error in test teardown:", error);
    throw error;
  }
}, 10000); // Increase timeout to 10 seconds

// Set up global test environment
global.__MONGO_URI__ = mongod?.getUri();
