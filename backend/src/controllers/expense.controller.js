import Expense from "../models/Expense.js";
import { createNotification } from "../controllers/notification.controller.js";
import { getHouseholdMembers } from "../utils/household.js";

export const createExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      description,
      due_date,
      splits,
      recurring,
      receipt_url,
    } = req.body;

    // Validate required fields
    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and category are required",
      });
    }

    // Create base expense object
    const expenseData = {
      title,
      amount,
      category,
      description,
      due_date: due_date ? new Date(due_date) : undefined,
      household_id: req.user.household_id,
      created_by: req.user._id,
      splits: splits || [],
      receipt_url,
    };

    // Add recurring data if present
    if (recurring?.is_recurring) {
      expenseData.recurring = {
        is_recurring: true,
        frequency: recurring.frequency || "monthly",
        next_due_date: recurring.next_due_date
          ? new Date(recurring.next_due_date)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }

    // Create the expense
    const expense = await Expense.create(expenseData);

    // If no splits provided, split equally among household members
    if (!splits || splits.length === 0) {
      const members = await getHouseholdMembers(req.user.household_id);
      await expense.splitEqually(members.map((m) => m._id));
      await expense.save();
    }

    // Create notifications for all users involved
    try {
      if (expense.splits.length > 0) {
        await Promise.all(
          expense.splits.map((split) =>
            createNotification({
              type: "expense_created",
              title: "New Expense Added",
              message: `You have been assigned to pay ${split.amount} for ${expense.title}`,
              recipient_ids: [split.user_id],
              reference: {
                model: "Expense",
                id: expense._id,
              },
            }),
          ),
        );
      }
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError);
      // Continue with the response even if notifications fail
    }

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { status, category, start_date, end_date } = req.query;
    const query = { household_id: req.user.household_id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (start_date || end_date) {
      query.due_date = {};
      if (start_date) query.due_date.$gte = new Date(start_date);
      if (end_date) query.due_date.$lte = new Date(end_date);
    }

    const expenses = await Expense.find(query)
      .populate("created_by", "name")
      .populate("splits.user_id", "name")
      .sort({ due_date: 1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markSplitAsPaid = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const split = expense.splits.find(
      (s) => s.user_id.toString() === req.user._id.toString(),
    );

    if (!split) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this expense",
      });
    }

    await expense.markSplitAsPaid(req.user._id);

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (expense.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this expense",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedExpense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (expense.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this expense",
      });
    }

    await expense.remove();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to calculate next due date for recurring expenses
const calculateNextDueDate = (currentDueDate, frequency) => {
  const date = new Date(currentDueDate);
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
};

export const getRecurringExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      household_id: req.user.household_id,
      "recurring.is_recurring": true,
    })
      .populate("created_by", "name")
      .populate("splits.user_id", "name")
      .sort({ "recurring.next_due_date": 1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleRecurring = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (expense.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this expense",
      });
    }

    expense.recurring = {
      is_recurring: !expense.recurring?.is_recurring,
      frequency: req.body.frequency || "monthly",
      next_due_date: req.body.next_due_date
        ? new Date(req.body.next_due_date)
        : new Date(),
    };

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
