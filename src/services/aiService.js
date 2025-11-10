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
    case 'DAILY_REVIEW':
      systemPrompt = 'Sen destekleyici ve motive edici bir AI koçusun. Türkçe konuş, samimi ve enerjik ol. Kullanıcıları hedeflerine ulaşmaları için cesaretlendir.';
      userPrompt = `Günlük değerlendirme: ${userName}

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

Türkçe motivasyon mesajı yaz (max 200 kelime). İlerlemeyi özel olarak değerlendir ve pratik tavsiyeler ver.`;
      break;

    case 'WEEKLY_REVIEW':
      systemPrompt = 'Sen analitik ve destekleyici bir AI koçusun. Türkçe haftalık değerlendirme yap.';
      userPrompt = `Haftalık değerlendirme: ${userName}

Durum:
- Aktif görevler: ${context.active_tasks.length}
- Bu hafta tamamlanan: ${context.completed_this_week}
- Streak: ${context.current_streak} gün
- Tamamlama oranı: ${(context.weekly_completion_rate * 100).toFixed(0)}%

${context.active_tasks.length > 0 ? `
Aktif görevler:
${context.active_tasks.map(task => `
- ${task.title}
  İlerleme: ${task.completed_steps}/${task.total_steps} adım
`).join('\n')}
` : ''}

Haftalık değerlendirme yap (max 250 kelime). Başarıları kutla, gelişim alanlarını belirt, gelecek hafta için öneriler sun.`;
      break;

    case 'DEADLINE_ALERT':
      systemPrompt = 'Sen hatırlatıcı ve motive edici bir AI koçusun. Türkçe deadline uyarısı yap.';
      userPrompt = `Deadline yaklaşıyor: ${userName}

${context.task ? `
Görev: ${context.task.title}
Kalan gün: ${context.task.daysRemaining}
İlerleme: ${context.task.completedSteps}/${context.task.totalSteps} adım
Öncelik: ${context.task.priority}
` : ''}

Nazikçe hatırlat, motive et ve son spurt için pratik öneriler ver (max 150 kelime).`;
      break;

    case 'INACTIVITY_ALERT':
      systemPrompt = 'Sen nazik ve teşvik edici bir AI koçusun. Türkçe hareketsizlik uyarısı yap.';
      userPrompt = `Hareketsizlik uyarısı: ${userName}

${context.task ? `
Görev: ${context.task.title}
Son aktivite: 48 saat+ önce
İlerleme: ${context.task.completedSteps}/${context.task.totalSteps} adım
` : `
Aktif görevler: ${context.active_tasks.length}
Son aktivite: 48+ saat önce
`}

Nazikçe hatırlat, motivasyon ver ve küçük bir adım atmayı öner (max 150 kelime).`;
      break;

    case 'PROGRESS_UPDATE':
      systemPrompt = 'Sen kutlayıcı ve motive edici bir AI koçusun. Türkçe ilerleme bildirimi yap.';
      userPrompt = `İlerleme güncelleme: ${userName}

${context.task ? `
Görev: ${context.task.title}
Yeni ilerleme: ${context.task.completedSteps}/${context.task.totalSteps} adım
Kalan: ${context.task.daysRemaining} gün
` : ''}

İlerlemeyi kutla, momentum için motive et (max 100 kelime).`;
      break;

    case 'COMPLETION_CELEBRATION':
      systemPrompt = 'Sen coşkulu ve kutlayıcı bir AI koçusun. Türkçe tamamlama kutlaması yap.';
      userPrompt = `Tamamlama kutlaması: ${userName}

${context.task ? `
Tamamlanan görev: ${context.task.title}
` : 'Bir görev tamamlandı!'}

Coşkuyla kutla! Başarıyı vurgula ve devam için motive et (max 120 kelime). 🎉`;
      break;

    case 'MOTIVATION':
      systemPrompt = 'Sen empatik ve enerjik bir AI koçusun. Türkçe konuş, içten ve motive edici ol.';
      userPrompt = `${userName} motivasyona ihtiyaç duyuyor.

Current situation:
- Active tasks: ${context.active_tasks.length}
- Current streak: ${context.current_streak} days
- Completed this week: ${context.completed_this_week}

${context.active_tasks.length > 0 ? `
Üzerinde çalıştığı görevler: ${context.active_tasks.map(t => t.title).join(', ')}
` : 'Şu anda aktif görevi yok.'}

Motive edici ve yükseltici bir mesaj yaz (max 150 kelime). Türkçe, samimi ve enerjik ol.`;
      break;

    case 'ANALYSIS':
      systemPrompt = 'Sen analitik bir AI koçusun. Türkçe analiz yap, yapıcı geri bildirim ver.';
      
      if (context.task) {
        // Specific task analysis
        userPrompt = `${userName} için görev analizi: "${context.task.title}"

Görev detayları:
- Açıklama: ${context.task.description}
- İlerleme: ${context.task.completedSteps}/${context.task.totalSteps} adım tamamlandı
${context.task.daysRemaining !== null ? `- Kalan gün: ${context.task.daysRemaining}` : ''}
- Öncelik: ${context.task.priority}

Türkçe analiz yap (max 250 kelime):
1. İlerleme değerlendirmesi
2. Potansiyel engeller veya endişeler
3. Spesifik öneriler`;
      } else {
        // Overall analysis
        userPrompt = `${userName} için genel durum analizi

İstatistikler:
- Aktif görevler: ${context.active_tasks.length}
- Backlog: ${context.backlog_count}
- Tamamlama oranı: ${(context.weekly_completion_rate * 100).toFixed(0)}%
- Streak: ${context.current_streak} gün

${context.active_tasks.length > 0 ? `
Aktif görevler:
${context.active_tasks.map(task => `- ${task.title} (${task.completed_steps}/${task.total_steps} adım)`).join('\n')}
` : ''}

Türkçe kapsamlı analiz yap, pratik öneriler ver (max 250 kelime).`;
      }
      break;

    default:
      systemPrompt = 'Sen yardımsever bir AI asistanısın. Türkçe konuş.';
      userPrompt = `${userName} için hedef takibi yardımı.`;
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
    return `Merhaba ${userName}! 👋\n\nŞu anda bağlantı sorunum var, ama sen harika işler yapıyorsun! Hedeflerine ulaşmak için çalışmaya devam et! 💪\n\nYakında yine görüşürüz! 🚀`;
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
      
      if (daysUntilDeadline === 3 || daysUntilDeadline === 1) {
        const context = {
          task: {
            title: task.title,
            daysRemaining: daysUntilDeadline,
            completedSteps: task.steps.filter(s => s.completed).length,
            totalSteps: task.steps.length,
            priority: task.priority
          }
        };
        
        const message = await generateMotivationalMessage(user.name, context, 'DEADLINE_ALERT');
        
        const interaction = await prisma.aIInteraction.create({
          data: {
            userId: user.id,
            taskId: task.id,
            message: `Deadline uyarısı: ${task.title} - ${daysUntilDeadline} gün kaldı`,
            aiResponse: message,
            interactionType: 'MOTIVATION'
          }
        });
        
        console.log(`📅 Deadline uyarısı gönderildi: ${user.name} - ${task.title} (${daysUntilDeadline} gün)`);
        
        // Send push notification
        const { notifyUser } = await import('./notificationService.js');
        await notifyUser(
          user.id,
          `⏰ Deadline Yaklaşıyor!`,
          `${task.title} için ${daysUntilDeadline} gün kaldı`,
          {
            type: 'deadline_alert',
            taskId: task.id,
            interactionId: interaction.id
          }
        );
      }
    }

    // Check inactivity (48 hours)
    if (task.activityLogs.length > 0) {
      const lastActivity = new Date(task.activityLogs[0].timestamp);
      const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
      
      if (hoursSinceActivity >= 48 && user.notificationSettings?.inactivityAlerts !== false) {
        const context = {
          task: {
            title: task.title,
            completedSteps: task.steps.filter(s => s.completed).length,
            totalSteps: task.steps.length
          }
        };
        
        const message = await generateMotivationalMessage(user.name, context, 'INACTIVITY_ALERT');
        
        const interaction = await prisma.aIInteraction.create({
          data: {
            userId: user.id,
            taskId: task.id,
            message: `Hareketsizlik uyarısı: ${task.title}`,
            aiResponse: message,
            interactionType: 'CHECK_IN'
          }
        });
        
        console.log(`😴 Hareketsizlik uyarısı gönderildi: ${user.name} - ${task.title}`);
        
        // Send push notification
        const { notifyUser } = await import('./notificationService.js');
        await notifyUser(
          user.id,
          `💤 Seni Özledik!`,
          `${task.title} görevi seni bekliyor`,
          {
            type: 'inactivity_alert',
            taskId: task.id,
            interactionId: interaction.id
          }
        );
      }
    }
  }
}

export default {
  buildUserContext,
  generateMotivationalMessage,
  checkTriggers
};
