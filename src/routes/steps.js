import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all steps for a task
router.get('/tasks/:taskId/steps', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: req.user.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const steps = await prisma.step.findMany({
      where: { taskId },
      orderBy: { order: 'asc' }
    });

    res.json(steps);
  } catch (error) {
    next(error);
  }
});

// Create a new step
router.post(
  '/tasks/:taskId/steps',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('order').optional().isInt()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { title, description, order } = req.body;

      // Verify task ownership
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: req.user.userId }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get the next order number if not provided
      let stepOrder = order;
      if (stepOrder === undefined) {
        const maxOrderStep = await prisma.step.findFirst({
          where: { taskId },
          orderBy: { order: 'desc' }
        });
        stepOrder = maxOrderStep ? maxOrderStep.order + 1 : 0;
      }

      const step = await prisma.step.create({
        data: {
          taskId,
          title,
          description,
          order: stepOrder
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          taskId,
          stepId: step.id,
          actionType: 'CREATED',
          details: {
            message: `Step created: ${title}`
          }
        }
      });

      res.status(201).json(step);
    } catch (error) {
      next(error);
    }
  }
);

// Update a step
router.put('/steps/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    // Verify ownership through task
    const existingStep = await prisma.step.findUnique({
      where: { id },
      include: {
        task: true
      }
    });

    if (!existingStep || existingStep.task.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const step = await prisma.step.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(order !== undefined && { order })
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: existingStep.taskId,
        stepId: step.id,
        actionType: 'UPDATED',
        details: {
          message: `Step updated: ${step.title}`
        }
      }
    });

    res.json(step);
  } catch (error) {
    next(error);
  }
});

// Toggle step completion
router.patch('/steps/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership through task
    const existingStep = await prisma.step.findUnique({
      where: { id },
      include: {
        task: true
      }
    });

    if (!existingStep || existingStep.task.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Step not found' });
    }

    const newCompletedStatus = !existingStep.completed;

    const step = await prisma.step.update({
      where: { id },
      data: {
        completed: newCompletedStatus,
        completedAt: newCompletedStatus ? new Date() : null
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        taskId: existingStep.taskId,
        stepId: step.id,
        actionType: newCompletedStatus ? 'COMPLETED' : 'UPDATED',
        details: {
          message: newCompletedStatus 
            ? `Step completed: ${step.title}`
            : `Step marked as incomplete: ${step.title}`
        }
      }
    });

    // Check if all steps are completed
    const allSteps = await prisma.step.findMany({
      where: { taskId: existingStep.taskId }
    });

    const allCompleted = allSteps.every(s => s.id === id ? newCompletedStatus : s.completed);

    if (allCompleted && allSteps.length > 0) {
      // Mark task as completed
      const completedTask = await prisma.task.update({
        where: { id: existingStep.taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        },
        include: { user: true }
      });

      await prisma.activityLog.create({
        data: {
          taskId: existingStep.taskId,
          actionType: 'COMPLETED',
          details: {
            message: 'Task completed - all steps finished!'
          }
        }
      });
      
      // Send completion celebration
      if (completedTask.user.notificationSettings?.completionCelebrations !== false) {
        const { buildUserContext, generateMotivationalMessage } = await import('../services/aiService.js');
        const context = { task: { title: completedTask.title } };
        const aiMessage = await generateMotivationalMessage(
          completedTask.user.name, 
          context, 
          'COMPLETION_CELEBRATION'
        );
        
        // Save AI interaction
        const interaction = await prisma.aIInteraction.create({
          data: {
            userId: completedTask.userId,
            taskId: completedTask.id,
            message: `Tamamlama kutlaması: ${completedTask.title}`,
            aiResponse: aiMessage,
            interactionType: 'MOTIVATION'
          }
        });
        
        // Send push notification
        const { notifyUser } = await import('../services/notificationService.js');
        await notifyUser(
          completedTask.userId,
          '🎉 TEBRİKLER!',
          `"${completedTask.title}" tamamlandı!`,
          {
            type: 'completion_celebration',
            taskId: completedTask.id,
            interactionId: interaction.id
          }
        );
        
        console.log(`🎉 Tamamlama kutlaması gönderildi: ${completedTask.user.name} - ${completedTask.title}`);
      }
    }

    res.json(step);
  } catch (error) {
    next(error);
  }
});

// Delete a step
router.delete('/steps/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership through task
    const step = await prisma.step.findUnique({
      where: { id },
      include: {
        task: true
      }
    });

    if (!step || step.task.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Step not found' });
    }

    await prisma.step.delete({
      where: { id }
    });

    res.json({ message: 'Step deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
