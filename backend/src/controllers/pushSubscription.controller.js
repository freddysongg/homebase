import PushSubscription from "@models/PushSubscription.js";

export const subscribe = async (req, res) => {
  try {
    const { subscription, browser, device } = req.body;

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.keys = subscription.keys;
      existingSubscription.browser = browser;
      existingSubscription.device = device;
      existingSubscription.last_used = new Date();
      await existingSubscription.save();

      return res.status(200).json({
        success: true,
        message: "Push subscription updated",
      });
    }

    // Create new subscription
    await PushSubscription.create({
      user_id: req.user._id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      browser,
      device,
      last_used: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Push subscription created",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    const subscription = await PushSubscription.findOne({ endpoint });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unsubscribe this endpoint",
      });
    }

    await subscription.remove();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find({
      user_id: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
