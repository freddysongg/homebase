import Notification from '../models/Notification.js';

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Public
const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Public
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('recipient_ids');
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get notifications for a specific user
// @route   GET /api/notifications/user/:userId
// @access  Public
const getNotificationsByUser = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient_ids: req.params.userId }).populate('recipient_ids');
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Public
const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('recipient_ids');
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a notification (e.g., mark as read)
// @route   PUT /api/notifications/:id
// @access  Public
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('recipient_ids');
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Public
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
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
  createNotification,
  getNotifications,
  getNotificationsByUser,
  getNotification,
  updateNotification,
  deleteNotification
};