import { jest } from "@jest/globals";
import mongoose from "mongoose";

export const createNotification = jest.fn().mockImplementation((data) => {
  // Validate required fields
  if (
    !data.type ||
    !data.title ||
    !data.message ||
    !data.recipient_ids ||
    !data.reference
  ) {
    throw new Error("Missing required notification fields");
  }

  // Return a mock notification
  return Promise.resolve({
    _id: new mongoose.Types.ObjectId(),
    type: data.type,
    title: data.title,
    message: data.message,
    recipient_ids: data.recipient_ids,
    reference: data.reference,
    status: data.status || "unread",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// Reset mock between tests
beforeEach(() => {
  createNotification.mockClear();
});
