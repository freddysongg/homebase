import Expense from "@models/Expense.js";
import { createNotification } from "@controllers/notification.controller.js";

export const processRecurringExpenses = async () => {
  try {
    const now = new Date();
    const recurringExpenses = await Expense.find({
      "recurring.is_recurring": true,
      "recurring.next_due_date": { $lte: now },
    });

    for (const expense of recurringExpenses) {
      // Create new expense instance for the next period
      const newExpense = await Expense.create({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        household_id: expense.household_id,
        created_by: expense.created_by,
        splits: expense.splits.map((split) => ({
          user_id: split.user_id,
          amount: split.amount,
          paid: false,
        })),
        recurring: {
          ...expense.recurring,
          next_due_date: calculateNextDueDate(
            expense.recurring.next_due_date,
            expense.recurring.frequency,
          ),
        },
      });

      // Update next due date on original recurring expense
      expense.recurring.next_due_date = calculateNextDueDate(
        expense.recurring.next_due_date,
        expense.recurring.frequency,
      );
      await expense.save();

      // Create notifications for all users involved
      await Promise.all(
        newExpense.splits.map((split) =>
          createNotification({
            type: "expense_alert",
            title: "Recurring Expense Due",
            message: `Your recurring payment of ${split.amount} for ${newExpense.title} is due`,
            recipient_ids: [split.user_id],
            reference: {
              model: "Expense",
              id: newExpense._id,
            },
          }),
        ),
      );
    }
  } catch (error) {
    console.error("Error processing recurring expenses:", error);
  }
};

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
