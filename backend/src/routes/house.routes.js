import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createHouse,
  getHouse,
  updateHouse,
  deleteHouse,
} from "../controllers/house.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createHouse);

router.route("/:id").get(getHouse).put(updateHouse).delete(deleteHouse);

export default router;
