import apn from 'node-apn';

let apnProvider = null;

// Initialize APN provider
function initializeAPNProvider() {
  if (!process.env.APNS_KEY || !process.env.APNS_KEY_ID || !process.env.APNS_TEAM_ID) {
    console.warn('APNS credentials not configured. Push notifications will be disabled.');
    return null;
  }

  try {
    const options = {
      token: {
        key: process.env.APNS_KEY,
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APNS_TEAM_ID
      },
      production: process.env.APNS_PRODUCTION === 'true'
    };

    return new apn.Provider(options);
  } catch (error) {
    console.error('Failed to initialize APN provider:', error);
    return null;
  }
}

// Get or initialize provider
function getAPNProvider() {
  if (!apnProvider) {
    apnProvider = initializeAPNProvider();
  }
  return apnProvider;
}

// Send push notification
export async function sendPushNotification(deviceToken, title, body, data = {}) {
  const provider = getAPNProvider();

  if (!provider) {
    console.log('Push notification skipped (APN not configured):', title);
    return { success: false, error: 'APN not configured' };
  }

  try {
    const notification = new apn.Notification();
    notification.alert = {
      title,
      body
    };
    notification.topic = process.env.APNS_BUNDLE_ID || 'com.goaltracker.app';
    notification.sound = 'default';
    notification.badge = 1;
    notification.payload = data;

    const result = await provider.send(notification, deviceToken);

    if (result.failed.length > 0) {
      console.error('Failed to send notification:', result.failed);
      return { 
        success: false, 
        error: result.failed[0].response?.reason || 'Unknown error' 
      };
    }

    console.log('Push notification sent successfully:', title);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

// Send notification to user
export async function notifyUser(userId, title, body, data = {}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.notificationSettings?.deviceToken) {
      console.log(`No device token for user ${userId}`);
      return { success: false, error: 'No device token' };
    }

    return await sendPushNotification(
      user.notificationSettings.deviceToken,
      title,
      body,
      data
    );
  } catch (error) {
    console.error('Error notifying user:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendPushNotification,
  notifyUser
};

