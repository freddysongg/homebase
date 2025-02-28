import { jest } from "@jest/globals";

// Mock web-push
jest.mock("web-push");

// Mock nodemailer
jest.mock("nodemailer");

// Mock other external services
jest.mock("@utils/push.js");
jest.mock("@utils/email.js");
