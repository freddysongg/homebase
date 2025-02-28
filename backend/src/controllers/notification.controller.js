import Notification from "@models/Notification.js";
import { sendEmail } from "@utils/email.js";
import { sendPushNotification } from "@utils/push.js";

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

    // Initialize read status for all recipients
    notification.recipient_ids.forEach((recipientId) => {
      notification.read_status.set(recipientId.toString(), false);
    });
    await notification.save();

    // Handle different delivery methods
    if (notification.delivery_methods.email) {
      await sendEmail(notification);
    }
    if (notification.delivery_methods.push) {
      await sendPushNotification(notification);
    }

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {
      recipient_ids: req.user._id,
      $or: [{ expires_at: { $gt: new Date() } }, { expires_at: null }],
    };

    // Add filters if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.read !== undefined) {
      query[`read_status.${req.user._id}`] = req.query.read === "true";
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.recipient_ids.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this notification",
      });
    }

    await notification.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.recipient_ids.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification",
      });
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
