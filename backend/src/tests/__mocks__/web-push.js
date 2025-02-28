import { jest } from "@jest/globals";

const webPush = {
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue(true),
};

export default webPush;
