import express from "express";
import { protect } from "@middleware/auth.js";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@controllers/notification.controller.js";

const router = express.Router();

router.use(protect); // Protect all notification routes

router.route("/").get(getUserNotifications).post(createNotification);

router.route("/mark-all-read").post(markAllAsRead);

router.route("/:id").post(markAsRead).delete(deleteNotification);

export default router;
