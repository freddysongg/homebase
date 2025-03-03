import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getUserNotifications);

router.route("/:id/read").post(markAsRead);

router.route("/mark-all-read").post(markAllAsRead);

router.route("/:id").delete(deleteNotification);

export default router;
