import Chore from "../models/Chore.js";
import { createNotification } from "./notification.controller.js";

// @desc    Create a new chore
// @route   POST /api/chores
// @access  Public
const createChore = async (req, res) => {
  try {
    const chore = await Chore.create({
      ...req.body,
      household_id: req.user.household_id,
    });

    // Create notifications for assigned users
    await Promise.all(
      chore.assigned_to.map((userId) =>
        createNotification({
          type: "chore_assigned",
          title: "New Chore Assigned",
          message: `You have been assigned to ${chore.name}`,
          recipient_ids: [userId],
          reference: {
            model: "Chore",
            id: chore._id,
          },
        }),
      ),
    );

    res.status(201).json({
      success: true,
      data: chore,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all chores
// @route   GET /api/chores
// @access  Public
const getChores = async (req, res) => {
  try {
    const chores = await Chore.find({ household_id: req.user.household_id });
    res.status(200).json({
      success: true,
      data: chores,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single chore
// @route   GET /api/chores/:id
// @access  Public
const getChore = async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }
    res.status(200).json({
      success: true,
      data: chore,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a chore
// @route   PUT /api/chores/:id
// @access  Public
const updateChore = async (req, res) => {
  try {
    const chore = await Chore.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }
    res.status(200).json({
      success: true,
      data: chore,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a chore
// @route   DELETE /api/chores/:id
// @access  Public
const deleteChore = async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }
    await chore.remove();
    res.status(200).json({
      success: true,
      message: "Chore deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createChore, getChores, getChore, updateChore, deleteChore };
