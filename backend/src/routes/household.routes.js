import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createHousehold,
  getHousehold,
  updateHousehold,
  deleteHousehold,
  addMember,
  removeMember,
} from "../controllers/household.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createHousehold);

router
  .route("/:id")
  .get(getHousehold)
  .put(updateHousehold)
  .delete(deleteHousehold);

router.route("/members").post(addMember);
router.route("/leaveHousehold").post(removeMember);

export default router;
