import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendPushNotification } from '../services/notificationService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get notification settings
router.get('/settings', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        notificationSettings: true
      }
    });

    res.json(user.notificationSettings || {
      dailyCheckIn: true,
      progressAlerts: true,
      inactivityAlerts: true,
      completionCelebrations: true,
      weeklyReview: true
    });
  } catch (error) {
    next(error);
  }
});

// Update notification settings
router.put(
  '/settings',
  [
    body('dailyCheckIn').optional().isBoolean(),
    body('progressAlerts').optional().isBoolean(),
    body('inactivityAlerts').optional().isBoolean(),
    body('completionCelebrations').optional().isBoolean(),
    body('weeklyReview').optional().isBoolean(),
    body('deviceToken').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        dailyCheckIn,
        progressAlerts,
        inactivityAlerts,
        completionCelebrations,
        weeklyReview,
        deviceToken
      } = req.body;

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      const currentSettings = currentUser.notificationSettings || {};

      const newSettings = {
        ...currentSettings,
        ...(dailyCheckIn !== undefined && { dailyCheckIn }),
        ...(progressAlerts !== undefined && { progressAlerts }),
        ...(inactivityAlerts !== undefined && { inactivityAlerts }),
        ...(completionCelebrations !== undefined && { completionCelebrations }),
        ...(weeklyReview !== undefined && { weeklyReview }),
        ...(deviceToken && { deviceToken })
      };

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          notificationSettings: newSettings
        },
        select: {
          notificationSettings: true
        }
      });

      res.json(user.notificationSettings);
    } catch (error) {
      next(error);
    }
  }
);

// Test push notification
router.post('/test', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const deviceToken = user.notificationSettings?.deviceToken;

    if (!deviceToken) {
      return res.status(400).json({ 
        error: 'No device token registered. Please update notification settings with a device token first.' 
      });
    }

    const result = await sendPushNotification(
      deviceToken,
      'Test Notification',
      'Your Goal Tracker notifications are working! 🎉'
    );

    res.json({
      success: result.success,
      message: result.success 
        ? 'Test notification sent successfully'
        : 'Failed to send notification',
      error: result.error
    });
  } catch (error) {
    next(error);
  }
});

export default router;
