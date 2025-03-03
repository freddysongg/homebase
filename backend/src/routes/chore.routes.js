import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createChore,
  getChores,
  getChore,
  updateChore,
  deleteChore,
} from "../controllers/chore.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getChores).post(createChore);

router.route("/:id").get(getChore).put(updateChore).delete(deleteChore);

export default router;
