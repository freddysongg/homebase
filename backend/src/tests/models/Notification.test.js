import mongoose from 'mongoose';
import Notification from '@models/Notification.js';
import User from '@models/User.js';
import { connectDB, disconnectDB } from '@config/db.js';

describe('Notification Model', () => {
  let testUser;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    try {
      await Promise.all([
        mongoose.connection.collection('notifications').deleteMany({}),
        mongoose.connection.collection('users').deleteMany({})
      ]);
      
      testUser = await User.create({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });
    } catch (error) {
      console.error('Error in beforeEach:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('should create a notification successfully', async () => {
    const notificationData = {
      type: 'chore reminder',
      message: 'Your chore is due tomorrow',
      recipient_ids: [testUser._id],
      timestamp: new Date(),
      read_status: false
    };

    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    expect(savedNotification._id).toBeDefined();
    expect(savedNotification.type).toBe(notificationData.type);
    expect(savedNotification.message).toBe(notificationData.message);
    expect(savedNotification.recipient_ids[0].toString()).toBe(testUser._id.toString());
    expect(savedNotification.read_status).toBe(false);
  });

  test('should fail when required fields are missing', async () => {
    const notification = new Notification({});
    
    let err;
    try {
      await notification.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
    expect(err.errors.message).toBeDefined();
  });

  test('should fail with invalid notification type', async () => {
    const notificationData = {
      type: 'invalid_type',
      message: 'Test message',
      recipient_ids: [testUser._id],
      timestamp: new Date()
    };

    const notification = new Notification(notificationData);
    
    let err;
    try {
      await notification.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.type).toBeDefined();
  });
});
