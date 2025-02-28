import { jest } from "@jest/globals";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect, authorize } from "@middleware/auth.js";
import User from "@models/User.js";

describe("Auth Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("protect middleware", () => {
    it("should return 401 if no token is provided", async () => {
      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to access this route",
      });
    }, 10000);

    it("should set req.user if valid token is provided", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        household_id: new mongoose.Types.ObjectId(),
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user._id.toString()).toBe(user._id.toString());
    }, 10000);
  });

  describe("authorize middleware", () => {
    it("should call next() if user has required role", () => {
      mockReq.user = { role: "admin" };
      const middleware = authorize("admin");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 403 if user does not have required role", () => {
      mockReq.user = { role: "member" };
      const middleware = authorize("admin");

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User role member is not authorized to access this route",
      });
    });
  });
});
