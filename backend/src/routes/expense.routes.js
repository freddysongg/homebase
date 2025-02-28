import express from "express";
import { protect } from "@middleware/auth.js";
import {
  createExpense,
  getExpenses,
  markSplitAsPaid,
  updateExpense,
  deleteExpense,
  getRecurringExpenses,
  toggleRecurring,
} from "@controllers/expense.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getExpenses).post(createExpense);

router.route("/:id").put(updateExpense).delete(deleteExpense);

router.route("/:id/mark-paid").post(markSplitAsPaid);

router.route("/recurring").get(getRecurringExpenses);

router.route("/:id/recurring").post(toggleRecurring);

export default router;
