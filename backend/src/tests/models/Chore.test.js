import mongoose from 'mongoose';
import Chore from '@models/Chore.js';
import User from '@models/User.js';
import { connectDB, disconnectDB } from '@config/db.js';

describe('Chore Model', () => {
  let testUser;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await Promise.all([
      mongoose.connection.collection('chores').deleteMany({}),
      mongoose.connection.collection('users').deleteMany({})
    ]);
    
    testUser = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('should create a chore successfully', async () => {
    const choreData = {
      description: 'Clean the kitchen',
      assigned_to: [testUser._id],
      due_date: new Date(Date.now() + 86400000), // Tomorrow
      status: 'pending',
      rotation: false
    };

    const chore = new Chore(choreData);
    const savedChore = await chore.save();

    expect(savedChore._id).toBeDefined();
    expect(savedChore.description).toBe(choreData.description);
    expect(savedChore.assigned_to[0].toString()).toBe(testUser._id.toString());
    expect(savedChore.status).toBe('pending');
  });

  test('should fail when required fields are missing', async () => {
    const chore = new Chore({});
    
    let err;
    try {
      await chore.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.description).toBeDefined();
    expect(err.errors.assigned_to).toBeDefined();
    expect(err.errors.due_date).toBeDefined();
  });

  test('should fail when due date is in the past', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday

    const choreData = {
      description: 'Past Chore',
      assigned_to: [testUser._id],
      due_date: pastDate,
      status: 'pending'
    };

    const chore = new Chore(choreData);
    
    await expect(chore.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
