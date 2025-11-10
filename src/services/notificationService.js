// Note: APNs (Apple Push Notifications) support removed for deployment simplicity
// If you need iOS push notifications, install @parse/node-apn or apn package
// and uncomment the implementation below

let apnProvider = null;

// Initialize APN provider
function initializeAPNProvider() {
  console.warn('APNS is not configured. Push notifications are disabled.');
  console.warn('To enable: npm install @parse/node-apn and configure APNS environment variables.');
  return null;
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
  console.log('Push notification skipped (APNs not installed):', title);
  console.log('Device:', deviceToken);
  console.log('Message:', body);
  
  // Return success for now - notifications are logged but not sent
  // To enable real push notifications:
  // 1. npm install @parse/node-apn
  // 2. Uncomment APN implementation above
  // 3. Configure APNS environment variables
  
  return { 
    success: false, 
    error: 'APNs not configured - notifications logged only' 
  };
}

// Send notification to user
export async function notifyUser(userId, title, body, data = {}) {
  try {
    // Import prisma here to avoid circular dependency
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    await prisma.$disconnect();

    if (!user?.notificationSettings?.deviceToken) {
      console.log(`📱 Push notification için device token yok: ${userId}`);
      console.log(`   Mesaj: ${title} - ${body}`);
      return { success: false, error: 'No device token' };
    }

    // Check if notifications are enabled
    if (user.notificationSettings?.aiNotifications === false) {
      console.log(`🔕 Kullanıcı bildirimleri kapattı: ${userId}`);
      return { success: false, error: 'Notifications disabled' };
    }

    console.log(`📨 Push notification gönderiliyor: ${title}`);
    return await sendPushNotification(
      user.notificationSettings.deviceToken,
      title,
      body,
      data
    );
  } catch (error) {
    console.error('❌ Bildirim gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendPushNotification,
  notifyUser
};

