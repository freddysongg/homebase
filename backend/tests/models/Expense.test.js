import mongoose from 'mongoose';
import Expense from '@models/Expense.js';
import User from '@models/User.js';
import { connectDB, disconnectDB } from '@config/db.js';

describe('Expense Model', () => {
  let testUser1, testUser2;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await Promise.all([
      mongoose.connection.collection('expenses').deleteMany({}),
      mongoose.connection.collection('users').deleteMany({})
    ]);

    const timestamp = Date.now();
    testUser1 = await User.create({
      name: 'Test User 1',
      email: `test1${timestamp}@example.com`,
      password: 'password123'
    });
    testUser2 = await User.create({
      name: 'Test User 2',
      email: `test2${timestamp}@example.com`,
      password: 'password123'
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('should create an expense successfully', async () => {
    const expenseData = {
      description: 'Groceries',
      total_amount: 100.00,
      paid_by: testUser1._id,
      split_among: [
        {
          user: testUser1._id,
          amount: 50.00
        },
        {
          user: testUser2._id,
          amount: 50.00
        }
      ],
      status: 'pending'
    };

    const expense = new Expense(expenseData);
    const savedExpense = await expense.save();

    expect(savedExpense._id).toBeDefined();
    expect(savedExpense.description).toBe(expenseData.description);
    expect(savedExpense.total_amount).toBe(expenseData.total_amount);
    expect(savedExpense.paid_by.toString()).toBe(testUser1._id.toString());
    expect(savedExpense.split_among).toHaveLength(2);
    expect(savedExpense.status).toBe('pending');
  });

  test('should fail when required fields are missing', async () => {
    const expense = new Expense({});
    
    let err;
    try {
      await expense.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.description).toBeDefined();
    expect(err.errors.total_amount).toBeDefined();
    expect(err.errors.paid_by).toBeDefined();
  });

  test('should fail when total amount is negative', async () => {
    const expenseData = {
      description: 'Negative Expense',
      total_amount: -50.00,
      paid_by: testUser1._id,
      split_among: [
        {
          user: testUser1._id,
          amount: -25.00
        },
        {
          user: testUser2._id,
          amount: -25.00
        }
      ]
    };

    const expense = new Expense(expenseData);
    
    await expect(expense.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
