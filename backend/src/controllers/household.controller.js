import Household from "../models/Household.js";
import User from "../models/User.js";

export const createHousehold = async (req, res) => {
  try {
    // Check if user already has a household
    if (req.user.household_id) {
      return res.status(400).json({
        success: false,
        message: "User already belongs to a household",
      });
    }

    const household = await Household.create({
      ...req.body,
      created_by: req.user._id,
      members: [req.user._id], // Add creator as first member
    });

    // Update user's household_id
    await User.findByIdAndUpdate(req.user._id, { household_id: household._id });

    res.status(201).json({
      success: true,
      data: household,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id).populate(
      "members",
      "name email",
    );

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    // Check if user is a member
    if (!household.members.some((member) => member._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this household",
      });
    }

    res.status(200).json({
      success: true,
      data: household,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    // Only creator can update household
    if (!household.created_by.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this household",
      });
    }

    const updatedHousehold = await Household.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      data: updatedHousehold,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: "Household not found",
      });
    }

    // Only creator can delete household
    if (!household.created_by.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this household",
      });
    }

    await household.remove();

    // Remove household_id from all members
    await User.updateMany(
      { household_id: household._id },
      { $unset: { household_id: "" } },
    );

    res.status(200).json({
      success: true,
      message: "Household deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user._id; // Extracted from the token

    // Step 1: Find the household with the matching homeCode
    const household = await Household.findOne({ joinCode });
    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Invalid home code',
      });
    }

    // Step 2: Check if the user is already a member
    if (household.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this household',
      });
    }

    // Step 3: Check if the user is already in another household
    const user = await User.findById(userId);
    if (user.household_id) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to another household',
      });
    }

    // Step 4: Add the user to the household's members array
    household.members.push(userId);
    await household.save();

    // Step 5: Update the user's household_id
    await User.findByIdAndUpdate(userId, { household_id: household._id });

    res.status(200).json({
      success: true,
      data: household,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};