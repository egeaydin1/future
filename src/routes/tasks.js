import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ========== BACKLOG ROUTES (Tarihsiz) ==========

// Get all backlog tasks
router.get('/backlog', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        status: 'BACKLOG'
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { steps: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create backlog task
router.post(
  '/backlog',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority = 'MEDIUM' } = req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority,
          status: 'BACKLOG',
          userId: req.user.userId
        },
        include: {
          steps: true
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          taskId: task.id,
          actionType: 'CREATED',
          details: {
            message: 'Task created in backlog'
          }
        }
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// Update backlog task
router.put('/backlog/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.userId, status: 'BACKLOG' }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority })
      },
      include: {
        steps: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        actionType: 'UPDATED',
        details: {
          message: 'Backlog task updated'
        }
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete backlog task
router.delete('/backlog/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user.userId, status: 'BACKLOG' }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== ACTIVE ROUTES (Deadline'lı) ==========

// Get all active tasks
router.get('/active', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        status: 'ACTIVE'
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { 
            steps: true,
            activityLogs: true
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    // Calculate additional metadata
    const tasksWithMetadata = tasks.map(task => ({
      ...task,
      completedSteps: task.steps.filter(s => s.completed).length,
      totalSteps: task.steps.length,
      daysRemaining: task.deadline 
        ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json(tasksWithMetadata);
  } catch (error) {
    next(error);
  }
});

// Move task from backlog to active (with deadline)
router.post(
  '/active',
  [
    body('taskId').isUUID(),
    body('deadline').isISO8601()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId, deadline } = req.body;

      // Verify ownership and status
      const existingTask = await prisma.task.findFirst({
        where: { id: taskId, userId: req.user.userId, status: 'BACKLOG' }
      });

      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found in backlog' });
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'ACTIVE',
          deadline: new Date(deadline)
        },
        include: {
          steps: true
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          taskId: task.id,
          actionType: 'UPDATED',
          details: {
            message: 'Task moved to active with deadline',
            deadline
          }
        }
      });

      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// Update active task
router.put('/active/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.userId, status: 'ACTIVE' }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority })
      },
      include: {
        steps: true
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Update deadline for active task
router.patch('/active/:id/deadline', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({ error: 'Deadline is required' });
    }

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.userId, status: 'ACTIVE' }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        deadline: new Date(deadline)
      },
      include: {
        steps: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        actionType: 'UPDATED',
        details: {
          message: 'Deadline updated',
          newDeadline: deadline
        }
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete active task
router.delete('/active/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user.userId, status: 'ACTIVE' }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== COMPLETED TASKS ==========

// Get completed tasks
router.get('/completed', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        status: 'COMPLETED'
      },
      include: {
        steps: true,
        _count: {
          select: { steps: true }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 50 // Last 50 completed tasks
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

export default router;
