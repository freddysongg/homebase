import House from '../models/House.js';

// @desc    Create a new house
// @route   POST /api/houses
// @access  Public
const createHouse = async (req, res) => {
  try {
    const house = await House.create(req.body);
    res.status(201).json({ success: true, data: house });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all houses
// @route   GET /api/houses
// @access  Public
const getHouses = async (req, res) => {
  try {
    const houses = await House.find();
    res.status(200).json({ success: true, count: houses.length, data: houses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single house by ID
// @route   GET /api/houses/:id
// @access  Public
const getHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }
    res.status(200).json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a house
// @route   PUT /api/houses/:id
// @access  Public
const updateHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated document
      runValidators: true,
    });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    res.status(200).json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Public
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }
    res.status(200).json({ success: true, message: 'House deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createHouse, getHouses, getHouse, updateHouse, deleteHouse };
