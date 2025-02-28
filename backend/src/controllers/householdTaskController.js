import HouseholdTask from '../models/HouseholdTask.js';

// @desc    Create a new household task
// @route   POST /api/household-tasks
// @access  Public
const createHouseholdTask = async (req, res) => {
  try {
    const householdTask = await HouseholdTask.create(req.body);
    res.status(201).json({
      success: true,
      data: householdTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all household tasks
// @route   GET /api/household-tasks
// @access  Public
const getHouseholdTasks = async (req, res) => {
  try {
    const householdTasks = await HouseholdTask.find().populate('assigned_to');
    res.status(200).json({
      success: true,
      count: householdTasks.length,
      data: householdTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single household task
// @route   GET /api/household-tasks/:id
// @access  Public
const getHouseholdTask = async (req, res) => {
  try {
    const householdTask = await HouseholdTask.findById(req.params.id).populate('assigned_to');
    if (!householdTask) {
      return res.status(404).json({
        success: false,
        message: 'Household task not found'
      });
    }
    res.status(200).json({
      success: true,
      data: householdTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a household task
// @route   PUT /api/household-tasks/:id
// @access  Public
const updateHouseholdTask = async (req, res) => {
  try {
    const householdTask = await HouseholdTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assigned_to');
    if (!householdTask) {
      return res.status(404).json({
        success: false,
        message: 'Household task not found'
      });
    }
    res.status(200).json({
      success: true,
      data: householdTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a household task
// @route   DELETE /api/household-tasks/:id
// @access  Public
const deleteHouseholdTask = async (req, res) => {
  try {
    const householdTask = await HouseholdTask.findByIdAndDelete(req.params.id);
    if (!householdTask) {
      return res.status(404).json({
        success: false,
        message: 'Household task not found'
      });
    }
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  createHouseholdTask,
  getHouseholdTasks,
  getHouseholdTask,
  updateHouseholdTask,
  deleteHouseholdTask
};