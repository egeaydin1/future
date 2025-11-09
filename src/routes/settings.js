import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        notificationSettings: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', 
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;

      // Check if email already exists
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.user.userId }
          }
        });

        if (existingUser) {
          return res.status(409).json({ 
            error: 'Bu email adresi zaten kullanımda',
            errorCode: 'EMAIL_IN_USE'
          });
        }
      }

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          ...(name && { name }),
          ...(email && { email })
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          notificationSettings: true
        }
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.post('/change-password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Mevcut şifre yanlış',
          errorCode: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedPassword }
      });

      res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
      next(error);
    }
  }
);

// Get notification settings
router.get('/notifications', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        notificationSettings: true
      }
    });

    const settings = user.notificationSettings || {
      dailyCheckIn: true,
      weeklyReview: true,
      deadlineAlerts: true,
      progressAlerts: true,
      inactivityAlerts: true,
      completionCelebrations: true,
      aiNotifications: true
    };

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Update notification settings
router.put('/notifications',
  [
    body('dailyCheckIn').optional().isBoolean(),
    body('weeklyReview').optional().isBoolean(),
    body('deadlineAlerts').optional().isBoolean(),
    body('progressAlerts').optional().isBoolean(),
    body('inactivityAlerts').optional().isBoolean(),
    body('completionCelebrations').optional().isBoolean(),
    body('aiNotifications').optional().isBoolean(),
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
        weeklyReview,
        deadlineAlerts,
        progressAlerts,
        inactivityAlerts,
        completionCelebrations,
        aiNotifications,
        deviceToken
      } = req.body;

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      const currentSettings = currentUser.notificationSettings || {};

      const newSettings = {
        ...currentSettings,
        ...(dailyCheckIn !== undefined && { dailyCheckIn }),
        ...(weeklyReview !== undefined && { weeklyReview }),
        ...(deadlineAlerts !== undefined && { deadlineAlerts }),
        ...(progressAlerts !== undefined && { progressAlerts }),
        ...(inactivityAlerts !== undefined && { inactivityAlerts }),
        ...(completionCelebrations !== undefined && { completionCelebrations }),
        ...(aiNotifications !== undefined && { aiNotifications }),
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

// Get user statistics
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts
    const [
      totalTasks,
      activeTasks,
      backlogTasks,
      completedTasks,
      completedThisWeek,
      completedThisMonth,
      totalSteps,
      completedSteps
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.task.count({ where: { userId, status: 'BACKLOG' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.task.count({ 
        where: { 
          userId, 
          status: 'COMPLETED',
          completedAt: { gte: oneWeekAgo }
        } 
      }),
      prisma.task.count({ 
        where: { 
          userId, 
          status: 'COMPLETED',
          completedAt: { gte: oneMonthAgo }
        } 
      }),
      prisma.step.count({ 
        where: { 
          task: { userId }
        } 
      }),
      prisma.step.count({ 
        where: { 
          task: { userId },
          completed: true
        } 
      })
    ]);

    // Calculate streak
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        task: { userId },
        actionType: 'COMPLETED'
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    let currentStreak = 0;
    if (activityLogs.length > 0) {
      const uniqueDates = [...new Set(activityLogs.map(log => {
        const date = new Date(log.timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }))].sort((a, b) => b - a);

      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const dateTimestamp of uniqueDates) {
        const daysDiff = Math.floor((currentDate.getTime() - dateTimestamp) / (1000 * 60 * 60 * 24));
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else if (daysDiff > currentStreak) {
          break;
        }
      }
    }

    // Completion rates
    const weeklyCompletionRate = completedThisWeek > 0 && activeTasks > 0
      ? (completedThisWeek / (completedThisWeek + activeTasks))
      : 0;

    const monthlyCompletionRate = completedThisMonth > 0 && totalTasks > 0
      ? (completedThisMonth / totalTasks)
      : 0;

    const stepCompletionRate = totalSteps > 0
      ? (completedSteps / totalSteps)
      : 0;

    res.json({
      tasks: {
        total: totalTasks,
        active: activeTasks,
        backlog: backlogTasks,
        completed: completedTasks,
        completedThisWeek,
        completedThisMonth
      },
      steps: {
        total: totalSteps,
        completed: completedSteps,
        completionRate: stepCompletionRate
      },
      streak: {
        current: currentStreak,
        unit: 'days'
      },
      completionRates: {
        weekly: weeklyCompletionRate,
        monthly: monthlyCompletionRate
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/account',
  [
    body('password').notEmpty(),
    body('confirmation').equals('DELETE')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { password } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Şifre yanlış',
          errorCode: 'INVALID_PASSWORD'
        });
      }

      // Delete user (cascades to all related data)
      await prisma.user.delete({
        where: { id: req.user.userId }
      });

      res.json({ message: 'Hesap başarıyla silindi' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

