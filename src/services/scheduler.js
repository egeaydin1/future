import cron from 'node-cron';
import prisma from '../config/database.js';
import { buildUserContext, generateMotivationalMessage, checkTriggers } from './aiService.js';
import { notifyUser } from './notificationService.js';

// Daily check-in at 9:00 AM
export function scheduleDailyCheckIn() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily check-in...');
    
    try {
      const users = await prisma.user.findMany({
        where: {
          notificationSettings: {
            path: ['dailyCheckIn'],
            equals: true
          }
        }
      });

      for (const user of users) {
        try {
          const context = await buildUserContext(user.id);
          const message = await generateMotivationalMessage(user.name, context, 'CHECK_IN');

          // Save interaction
          await prisma.aIInteraction.create({
            data: {
              userId: user.id,
              message: 'Daily check-in',
              aiResponse: message,
              interactionType: 'CHECK_IN'
            }
          });

          // Send notification
          await notifyUser(
            user.id,
            'Daily Check-in 🌟',
            message.substring(0, 100) + '...',
            { type: 'daily_checkin' }
          );

          console.log(`Daily check-in sent to ${user.name}`);
        } catch (error) {
          console.error(`Error sending check-in to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in daily check-in:', error);
    }
  });

  console.log('Daily check-in scheduler started (9:00 AM)');
}

// Weekly review on Sunday at 8:00 PM
export function scheduleWeeklyReview() {
  cron.schedule('0 20 * * 0', async () => {
    console.log('Running weekly review...');
    
    try {
      const users = await prisma.user.findMany({
        where: {
          notificationSettings: {
            path: ['weeklyReview'],
            equals: true
          }
        }
      });

      for (const user of users) {
        try {
          const context = await buildUserContext(user.id);
          const message = await generateMotivationalMessage(user.name, context, 'ANALYSIS');

          // Save interaction
          await prisma.aIInteraction.create({
            data: {
              userId: user.id,
              message: 'Weekly review',
              aiResponse: message,
              interactionType: 'ANALYSIS'
            }
          });

          // Send notification
          await notifyUser(
            user.id,
            'Weekly Review 📊',
            `This week: ${context.completed_this_week} tasks completed!`,
            { type: 'weekly_review' }
          );

          console.log(`Weekly review sent to ${user.name}`);
        } catch (error) {
          console.error(`Error sending weekly review to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in weekly review:', error);
    }
  });

  console.log('Weekly review scheduler started (Sunday 8:00 PM)');
}

// Check for progress alerts and inactivity every hour
export function scheduleProgressChecks() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running progress checks...');
    
    try {
      await checkTriggers();
    } catch (error) {
      console.error('Error in progress checks:', error);
    }
  });

  console.log('Progress checks scheduler started (hourly)');
}

// Initialize all schedulers
export function initializeSchedulers() {
  scheduleDailyCheckIn();
  scheduleWeeklyReview();
  scheduleProgressChecks();
  
  console.log('All schedulers initialized');
}

export default {
  initializeSchedulers,
  scheduleDailyCheckIn,
  scheduleWeeklyReview,
  scheduleProgressChecks
};

