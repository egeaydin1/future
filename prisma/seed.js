import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@goaltracker.com' },
    update: {},
    create: {
      email: 'demo@goaltracker.com',
      password: hashedPassword,
      name: 'Demo User',
      notificationSettings: {
        dailyCheckIn: true,
        progressAlerts: true,
        inactivityAlerts: true,
        completionCelebrations: true,
        weeklyReview: true
      }
    }
  });

  console.log('✅ Created demo user:', user.email);

  // Check if sample tasks already exist
  const existingTasks = await prisma.task.count({
    where: { userId: user.id }
  });

  if (existingTasks > 0) {
    console.log('⏭️  Sample tasks already exist, skipping creation...');
  } else {
    // Create sample backlog task
    const backlogTask = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Learn Node.js and Express',
        description: 'Master backend development with Node.js framework',
        status: 'BACKLOG',
        priority: 'MEDIUM'
      }
    });

    console.log('✅ Created backlog task:', backlogTask.title);

    // Create sample active task with deadline
    const activeTask = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Build Portfolio Website',
        description: 'Create a professional portfolio website to showcase projects',
        status: 'ACTIVE',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        steps: {
          create: [
          {
            title: 'Design wireframes',
            description: 'Create wireframes for all pages',
            order: 0,
            completed: true,
            completedAt: new Date()
          },
          {
            title: 'Set up project structure',
            description: 'Initialize React project with necessary dependencies',
            order: 1,
            completed: true,
            completedAt: new Date()
          },
          {
            title: 'Build home page',
            description: 'Create landing page with hero section',
            order: 2,
            completed: false
          },
          {
            title: 'Add projects section',
            description: 'Display portfolio projects with images and descriptions',
            order: 3,
            completed: false
          },
          {
            title: 'Deploy to production',
            description: 'Deploy website to Vercel or Netlify',
            order: 4,
            completed: false
          }
        ]
      }
    },
    include: {
      steps: true
    }
  });

    console.log('✅ Created active task with steps:', activeTask.title);

    // Create activity logs
    await prisma.activityLog.create({
      data: {
        taskId: activeTask.id,
        actionType: 'CREATED',
        details: {
          message: 'Task created and moved to active'
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        taskId: activeTask.id,
        stepId: activeTask.steps[0].id,
        actionType: 'COMPLETED',
        details: {
          message: 'Completed: Design wireframes'
        }
      }
    });

    console.log('✅ Created activity logs');

    // Create sample AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: user.id,
        message: 'Welcome check-in',
        aiResponse: `Welcome to Goal Tracker Pro, ${user.name}! 🎯\n\nI'm excited to help you achieve your goals. I see you've already started working on your portfolio website - that's fantastic! You've completed 2 out of 5 steps, showing great progress.\n\nRemember, consistency is key. Try to work on at least one step each day, and you'll have your portfolio ready in no time!\n\nLet's make this week productive! 💪`,
        interactionType: 'CHECK_IN'
      }
    });

    console.log('✅ Created sample AI interaction');
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Demo credentials:');
  console.log('  Email: demo@goaltracker.com');
  console.log('  Password: demo123456\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

