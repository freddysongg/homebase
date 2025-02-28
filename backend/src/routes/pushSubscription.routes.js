import express from "express";
import { protect } from "@middleware/auth.js";
import {
  subscribe,
  unsubscribe,
  getUserSubscriptions,
} from "@controllers/pushSubscription.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getUserSubscriptions).post(subscribe).delete(unsubscribe);

export default router;
