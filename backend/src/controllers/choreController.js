import Chore from "../models/Chore.js";

// @desc    Create a new chore
// @route   POST /api/chores
// @access  Public
const createChore = async (req, res) => {
  try {
    const chore = await Chore.create(req.body);
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
    const chores = await Chore.find().populate("assigned_to");
    res.status(200).json({
      success: true,
      count: chores.length,
      data: chores,
    });
  } catch (error) {
    res.status(500).json({
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
    const chore = await Chore.findById(req.params.id).populate("assigned_to");
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
    res.status(500).json({
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
    }).populate("assigned_to");
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
    const chore = await Chore.findByIdAndDelete(req.params.id);
    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createChore, getChores, getChore, updateChore, deleteChore };
