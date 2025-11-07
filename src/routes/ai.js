import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { callClaudeAPI, buildUserContext, generateMotivationalMessage } from '../services/aiService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Manual check-in
router.post('/check-in', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user with context
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Build context
    const context = await buildUserContext(userId);

    // Generate AI response
    const aiResponse = await generateMotivationalMessage(user.name, context, 'CHECK_IN');

    // Save interaction
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        message: 'Daily check-in',
        aiResponse,
        interactionType: 'CHECK_IN'
      }
    });

    res.json({
      message: aiResponse,
      context,
      interactionId: interaction.id
    });
  } catch (error) {
    next(error);
  }
});

// Get AI interaction history
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    const interactions = await prisma.aIInteraction.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Analyze task progress
router.post(
  '/analyze-progress',
  [
    body('taskId').optional().isUUID()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.userId;
      const { taskId } = req.body;

      let context;
      let message;

      if (taskId) {
        // Analyze specific task
        const task = await prisma.task.findFirst({
          where: { id: taskId, userId },
          include: {
            steps: true,
            activityLogs: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        });

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const completedSteps = task.steps.filter(s => s.completed).length;
        const totalSteps = task.steps.length;
        const daysRemaining = task.deadline 
          ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
          : null;

        context = {
          task: {
            title: task.title,
            description: task.description,
            completedSteps,
            totalSteps,
            daysRemaining,
            priority: task.priority,
            recentActivity: task.activityLogs
          }
        };

        message = `Analyzing progress for task: ${task.title}`;
      } else {
        // Analyze overall progress
        context = await buildUserContext(userId);
        message = 'Overall progress analysis';
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      const aiResponse = await generateMotivationalMessage(user.name, context, 'ANALYSIS');

      // Save interaction
      const interaction = await prisma.aIInteraction.create({
        data: {
          userId,
          taskId: taskId || null,
          message,
          aiResponse,
          interactionType: 'ANALYSIS'
        }
      });

      res.json({
        analysis: aiResponse,
        context,
        interactionId: interaction.id
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get motivation message
router.post('/motivation', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const context = await buildUserContext(userId);
    const aiResponse = await generateMotivationalMessage(user.name, context, 'MOTIVATION');

    // Save interaction
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        message: 'Motivation request',
        aiResponse,
        interactionType: 'MOTIVATION'
      }
    });

    res.json({
      message: aiResponse,
      interactionId: interaction.id
    });
  } catch (error) {
    next(error);
  }
});

export default router;
