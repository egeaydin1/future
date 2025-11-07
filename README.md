# Goal Tracker Pro - Backend API

AI-powered goal tracking backend built with Node.js, Express, PostgreSQL, and Claude AI.

## 🚀 Features

- **User Authentication**: JWT-based authentication
- **Task Management**: Backlog (tarihsiz) and Active (deadline'lı) tasks
- **Smart Steps**: Break down tasks into manageable steps
- **AI Coach**: Claude-powered motivational messages and progress analysis
- **Activity Tracking**: Comprehensive activity logs
- **Push Notifications**: APNs integration for iOS
- **Automated Check-ins**: Daily, weekly, and progress-based AI interactions

## 📋 Tech Stack

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI**: Anthropic Claude API
- **Authentication**: JWT
- **Notifications**: Apple Push Notification service (APNs)
- **Scheduler**: node-cron

## 🏗️ Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.js        # Prisma client config
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── tasks.js           # Task management
│   │   ├── steps.js           # Step management
│   │   ├── logs.js            # Activity logs
│   │   ├── ai.js              # AI interactions
│   │   └── notifications.js   # Notification settings
│   ├── services/
│   │   ├── aiService.js       # Claude AI integration
│   │   ├── notificationService.js  # Push notifications
│   │   └── scheduler.js       # Cron jobs
│   └── server.js              # Main server file
├── package.json
├── railway.json               # Railway deployment config
└── Procfile                   # Process configuration
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Apple Push Notifications (optional)
APNS_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_BUNDLE_ID=com.yourapp.goaltracker
APNS_PRODUCTION=false

# Server
PORT=3000
NODE_ENV=production
ENABLE_SCHEDULERS=true
```

## 🚀 Deployment to Railway

### 1. Prerequisites
- Railway account ([railway.app](https://railway.app))
- PostgreSQL database (Railway provides this)
- Anthropic API key

### 2. Deploy Steps

1. **Create new project on Railway**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL database**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Set environment variables**
   ```bash
   railway variables set JWT_SECRET=your-secret-here
   railway variables set ANTHROPIC_API_KEY=sk-ant-xxxxx
   railway variables set JWT_EXPIRES_IN=7d
   railway variables set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### 3. Alternative: GitHub Integration

1. Push code to GitHub
2. Connect repository in Railway dashboard
3. Set environment variables in Railway UI
4. Railway will auto-deploy on push

## 💻 Local Development

### Installation

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npm run prisma:migrate

# Open Prisma Studio
npx prisma studio
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Tasks - Backlog (Tarihsiz)
- `GET /api/tasks/backlog` - Get all backlog tasks
- `POST /api/tasks/backlog` - Create backlog task
- `PUT /api/tasks/backlog/:id` - Update backlog task
- `DELETE /api/tasks/backlog/:id` - Delete backlog task

### Tasks - Active (Deadline'lı)
- `GET /api/tasks/active` - Get all active tasks
- `POST /api/tasks/active` - Move task from backlog to active
- `PUT /api/tasks/active/:id` - Update active task
- `PATCH /api/tasks/active/:id/deadline` - Update deadline
- `DELETE /api/tasks/active/:id` - Delete active task

### Tasks - Completed
- `GET /api/tasks/completed` - Get completed tasks

### Steps
- `GET /api/tasks/:taskId/steps` - Get task steps
- `POST /api/tasks/:taskId/steps` - Create step
- `PUT /api/steps/:id` - Update step
- `PATCH /api/steps/:id/complete` - Toggle step completion
- `DELETE /api/steps/:id` - Delete step

### Activity Logs
- `GET /api/tasks/:taskId/logs` - Get task activity logs
- `POST /api/tasks/:taskId/logs` - Add comment/note

### AI Interactions
- `POST /api/ai/check-in` - Manual check-in
- `GET /api/ai/history` - Get AI interaction history
- `POST /api/ai/analyze-progress` - Analyze task progress
- `POST /api/ai/motivation` - Get motivation message

### Notifications
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update settings
- `POST /api/notifications/test` - Test push notification

## 🤖 AI Features

### Automated Triggers

1. **Daily Check-in**: 09:00 every day
2. **Weekly Review**: Sunday 20:00
3. **Progress Check**: 3 days before deadline
4. **Inactivity Alert**: 48 hours without activity
5. **Completion Celebration**: When task is completed

### AI Context

The AI receives:
- Active tasks with progress
- Completion rates
- Current streak
- Backlog count
- Recent activity

## 🔒 Authentication

All endpoints except `/api/auth/*` require JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📊 Database Schema

- **Users**: User accounts and settings
- **Tasks**: Backlog, Active, Completed tasks
- **Steps**: Task breakdown steps
- **ActivityLogs**: All task activities
- **AIInteractions**: AI conversation history

## 🐛 Error Handling

API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional information"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## 🔍 Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 License

MIT

## 🤝 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, Express, PostgreSQL, and Claude AI

