import webpush from "web-push";
import PushSubscription from "@models/PushSubscription.js";

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushNotification = async (notification) => {
  try {
    // Get subscription objects for each recipient
    const subscriptions = await getPushSubscriptions(
      notification.recipient_ids,
    );

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: "/icon.png", // Your app icon
      badge: "/badge.png", // Your notification badge
      data: {
        url: `${process.env.FRONTEND_URL}/notifications/${notification._id}`,
      },
    });

    // Send push notification to each subscription
    const sendPromises = subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, payload).catch((error) => {
        if (error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          removeSubscription(subscription.endpoint);
        }
        console.error("Push notification error:", error);
      }),
    );

    await Promise.all(sendPromises);
  } catch (error) {
    console.error("Push notification error:", error);
    // Don't throw error to prevent notification creation failure
  }
};

// Helper function to get push subscriptions from database
const getPushSubscriptions = async (userIds) => {
  const subscriptions = await PushSubscription.find({
    user_id: { $in: userIds },
  });

  return subscriptions.map((sub) => ({
    endpoint: sub.endpoint,
    keys: sub.keys,
  }));
};

// Helper function to remove invalid subscriptions
const removeSubscription = async (endpoint) => {
  try {
    await PushSubscription.deleteOne({ endpoint });
  } catch (error) {
    console.error("Error removing subscription:", error);
  }
};
