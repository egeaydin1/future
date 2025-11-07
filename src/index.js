require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const stepRoutes = require('./routes/steps');
const activityLogRoutes = require('./routes/activityLogs');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

// Services
const aiService = require('./services/aiService');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/logs', activityLogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Cron jobs for AI agent
// Daily check-in at 09:00
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily check-in...');
  await aiService.runDailyCheckIn();
});

// Weekly review every Sunday at 20:00
cron.schedule('0 20 * * 0', async () => {
  console.log('Running weekly review...');
  await aiService.runWeeklyReview();
});

// Check for progress and inactivity every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running progress and inactivity checks...');
  await aiService.checkProgressAndInactivity();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

