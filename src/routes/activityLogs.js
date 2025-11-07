const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authMiddleware);

// Helper function to verify task ownership
const verifyTaskOwnership = async (taskId, userId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });
  return !!task;
};

// POST /api/logs/task/:taskId - Add a comment/log to a task
router.post('/task/:taskId',
  [
    body('comment').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { comment } = req.body;

      const hasAccess = await verifyTaskOwnership(taskId, req.userId);
      if (!hasAccess) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const log = await prisma.activityLog.create({
        data: {
          taskId,
          actionType: 'COMMENTED',
          details: { comment }
        }
      });

      res.status(201).json(log);
    } catch (error) {
      console.error('Create activity log error:', error);
      res.status(500).json({ error: 'Failed to create log' });
    }
  }
);

module.exports = router;

