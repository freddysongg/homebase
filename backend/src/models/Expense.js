import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paid_at: Date,
});

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["rent", "utilities", "groceries", "household", "other"],
    },
    description: {
      type: String,
      trim: true,
    },
    due_date: Date,
    household_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receipt_url: String,
    splits: [splitSchema],
    recurring: {
      is_recurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["weekly", "monthly", "yearly"],
      },
      next_due_date: Date,
    },
    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "overdue"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
expenseSchema.index({ household_id: 1 });
expenseSchema.index({ created_by: 1 });
expenseSchema.index({ due_date: 1 });
expenseSchema.index({ "splits.user_id": 1 });

// Methods
expenseSchema.methods.calculateTotalPaid = function () {
  return this.splits.reduce((total, split) => {
    return total + (split.paid ? split.amount : 0);
  }, 0);
};

expenseSchema.methods.updateStatus = function () {
  const totalPaid = this.calculateTotalPaid();

  if (totalPaid === 0) {
    this.status =
      this.due_date && this.due_date < new Date() ? "overdue" : "pending";
  } else if (totalPaid === this.amount) {
    this.status = "paid";
  } else {
    this.status = "partially_paid";
  }

  return this.save();
};

// Split expense equally among users
expenseSchema.methods.splitEqually = async function (userIds) {
  const splitAmount = this.amount / userIds.length;

  this.splits = userIds.map((userId) => ({
    user_id: userId,
    amount: splitAmount,
    paid: false,
  }));

  return this.save();
};

// Mark a user's split as paid
expenseSchema.methods.markSplitAsPaid = async function (userId) {
  const split = this.splits.find(
    (s) => s.user_id.toString() === userId.toString(),
  );
  if (split) {
    split.paid = true;
    split.paid_at = new Date();
    await this.save();
    await this.updateStatus();
  }
  return this;
};

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
