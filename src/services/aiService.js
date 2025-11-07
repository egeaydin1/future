import OpenAI from 'openai';
import prisma from '../config/database.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build user context for AI
export async function buildUserContext(userId) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get active tasks
  const activeTasks = await prisma.task.findMany({
    where: {
      userId,
      status: 'ACTIVE'
    },
    include: {
      steps: true,
      activityLogs: {
        where: {
          timestamp: {
            gte: oneWeekAgo
          }
        }
      }
    }
  });

  // Get backlog count
  const backlogCount = await prisma.task.count({
    where: {
      userId,
      status: 'BACKLOG'
    }
  });

  // Get weekly completed tasks
  const completedThisWeek = await prisma.task.count({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: {
        gte: oneWeekAgo
      }
    }
  });

  // Calculate completion rate
  const totalTasksThisWeek = activeTasks.length + completedThisWeek;
  const weeklyCompletionRate = totalTasksThisWeek > 0 
    ? (completedThisWeek / totalTasksThisWeek)
    : 0;

  // Calculate current streak (consecutive days with activity)
  const currentStreak = await calculateStreak(userId);

  // Format active tasks
  const formattedActiveTasks = activeTasks.map(task => {
    const totalSteps = task.steps.length;
    const completedSteps = task.steps.filter(s => s.completed).length;
    const daysRemaining = task.deadline 
      ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
      : null;
    
    const lastActivity = task.activityLogs.length > 0
      ? task.activityLogs[0].timestamp
      : task.updatedAt;

    return {
      id: task.id,
      title: task.title,
      deadline: task.deadline,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      days_remaining: daysRemaining,
      last_activity: lastActivity,
      priority: task.priority
    };
  });

  return {
    active_tasks: formattedActiveTasks,
    backlog_count: backlogCount,
    weekly_completion_rate: weeklyCompletionRate,
    current_streak: currentStreak,
    completed_this_week: completedThisWeek
  };
}

// Calculate user's current streak
async function calculateStreak(userId) {
  const logs = await prisma.activityLog.findMany({
    where: {
      task: {
        userId
      },
      actionType: 'COMPLETED'
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100
  });

  if (logs.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const activityDates = logs.map(log => {
    const date = new Date(log.timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const uniqueDates = [...new Set(activityDates)].sort((a, b) => b - a);

  for (const dateTimestamp of uniqueDates) {
    const daysDiff = Math.floor((currentDate.getTime() - dateTimestamp) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

// Generate motivational message using Claude
export async function generateMotivationalMessage(userName, context, type) {
  let systemPrompt = '';
  let userPrompt = '';

  switch (type) {
    case 'CHECK_IN':
      systemPrompt = 'You are a supportive and motivating AI coach helping users with their goals. Be encouraging, specific, and actionable in your advice.';
      userPrompt = `Daily check-in for ${userName}.

Current situation:
- Active tasks: ${context.active_tasks.length}
- Backlog tasks: ${context.backlog_count}
- Completed this week: ${context.completed_this_week}
- Current streak: ${context.current_streak} days
- Weekly completion rate: ${(context.weekly_completion_rate * 100).toFixed(0)}%

${context.active_tasks.length > 0 ? `
Active tasks details:
${context.active_tasks.map(task => `
- ${task.title}
  Progress: ${task.completed_steps}/${task.total_steps} steps
  ${task.days_remaining !== null ? `Deadline: ${task.days_remaining} days remaining` : ''}
  Priority: ${task.priority}
`).join('\n')}
` : ''}

Provide a motivating check-in message. Keep it under 200 words, be specific about their progress, and give actionable advice.`;
      break;

    case 'MOTIVATION':
      systemPrompt = 'You are an empathetic and energizing AI coach. Provide genuine motivation and encouragement.';
      userPrompt = `${userName} needs motivation.

Current situation:
- Active tasks: ${context.active_tasks.length}
- Current streak: ${context.current_streak} days
- Completed this week: ${context.completed_this_week}

${context.active_tasks.length > 0 ? `
They're working on: ${context.active_tasks.map(t => t.title).join(', ')}
` : 'They have no active tasks at the moment.'}

Provide an uplifting and motivating message. Keep it under 150 words.`;
      break;

    case 'ANALYSIS':
      systemPrompt = 'You are an analytical AI coach. Provide insights and constructive feedback on progress.';
      
      if (context.task) {
        // Specific task analysis
        userPrompt = `Analyze progress for ${userName}'s task: "${context.task.title}"

Task details:
- Description: ${context.task.description}
- Progress: ${context.task.completedSteps}/${context.task.totalSteps} steps completed
${context.task.daysRemaining !== null ? `- Days remaining: ${context.task.daysRemaining}` : ''}
- Priority: ${context.task.priority}

Provide analysis with:
1. Progress assessment
2. Potential blockers or concerns
3. Specific recommendations

Keep it under 250 words.`;
      } else {
        // Overall analysis
        userPrompt = `Analyze ${userName}'s overall progress.

Stats:
- Active tasks: ${context.active_tasks.length}
- Backlog: ${context.backlog_count}
- Completion rate: ${(context.weekly_completion_rate * 100).toFixed(0)}%
- Streak: ${context.current_streak} days

${context.active_tasks.length > 0 ? `
Active tasks:
${context.active_tasks.map(task => `- ${task.title} (${task.completed_steps}/${task.total_steps} steps)`).join('\n')}
` : ''}

Provide comprehensive analysis with actionable insights. Keep it under 250 words.`;
      }
      break;

    default:
      systemPrompt = 'You are a helpful AI assistant for goal tracking.';
      userPrompt = `Help ${userName} with their goals.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback message if API fails
    return `Hey ${userName}! I'm having trouble connecting right now, but keep up the great work on your goals! 💪`;
  }
}

// Check for trigger conditions and send appropriate notifications
export async function checkTriggers() {
  const now = new Date();
  
  // Get all active tasks that need attention
  const tasks = await prisma.task.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      user: true,
      steps: true,
      activityLogs: {
        orderBy: { timestamp: 'desc' },
        take: 1
      }
    }
  });

  for (const task of tasks) {
    const user = task.user;
    
    // Skip if user has notifications disabled
    if (user.notificationSettings?.progressAlerts === false) continue;

    // Check deadline (3 days warning)
    if (task.deadline) {
      const daysUntilDeadline = Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline === 3) {
        const context = await buildUserContext(user.id);
        const message = await generateMotivationalMessage(user.name, context, 'MOTIVATION');
        
        await prisma.aIInteraction.create({
          data: {
            userId: user.id,
            taskId: task.id,
            message: `Deadline reminder: ${task.title}`,
            aiResponse: message,
            interactionType: 'MOTIVATION'
          }
        });
        
        // Send push notification here
        console.log(`Deadline reminder sent to ${user.name} for task: ${task.title}`);
      }
    }

    // Check inactivity (48 hours)
    if (task.activityLogs.length > 0) {
      const lastActivity = new Date(task.activityLogs[0].timestamp);
      const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
      
      if (hoursSinceActivity >= 48 && user.notificationSettings?.inactivityAlerts !== false) {
        const context = await buildUserContext(user.id);
        const message = await generateMotivationalMessage(user.name, context, 'CHECK_IN');
        
        await prisma.aIInteraction.create({
          data: {
            userId: user.id,
            taskId: task.id,
            message: `Inactivity alert: ${task.title}`,
            aiResponse: message,
            interactionType: 'CHECK_IN'
          }
        });
        
        console.log(`Inactivity alert sent to ${user.name} for task: ${task.title}`);
      }
    }
  }
}

export default {
  buildUserContext,
  generateMotivationalMessage,
  checkTriggers
};
