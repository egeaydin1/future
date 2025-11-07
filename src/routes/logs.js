import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get activity logs for a task
router.get('/tasks/:taskId/logs', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.user.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: {
        step: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Last 100 logs
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Create a comment/note log
router.post(
  '/tasks/:taskId/logs',
  [
    body('message').trim().notEmpty(),
    body('stepId').optional().isUUID()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { message, stepId } = req.body;

      // Verify task ownership
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: req.user.userId }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const log = await prisma.activityLog.create({
        data: {
          taskId,
          stepId: stepId || null,
          actionType: 'COMMENTED',
          details: {
            message
          }
        },
        include: {
          step: true
        }
      });

      res.status(201).json(log);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

