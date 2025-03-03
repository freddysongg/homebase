import { jest } from "@jest/globals";

// Mock nodemailer
jest.mock("nodemailer");

// Mock other external services
jest.mock("@utils/email.js");
