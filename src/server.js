import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSchedulers } from './services/scheduler.js';

// Import routes
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import stepsRoutes from './routes/steps.js';
import logsRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Goal Tracker Pro API',
    version: '1.0.0'
  });
});

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check OpenAI API key
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({ 
      status: 'healthy',
      database: 'connected',
      openai: openaiConfigured ? 'configured' : 'missing',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api', stepsRoutes);
app.use('/api', logsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize AI schedulers
  if (process.env.ENABLE_SCHEDULERS !== 'false') {
    initializeSchedulers();
  } else {
    console.log('⏸️  Schedulers disabled');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

