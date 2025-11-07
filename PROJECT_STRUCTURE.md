# 📁 Proje Yapısı

Goal Tracker Pro Backend'in detaylı dosya yapısı ve açıklamaları.

```
fuels-rs/
│
├── 📄 package.json              # Dependencies ve scripts
├── 📄 .gitignore               # Git ignore kuralları
├── 📄 .dockerignore            # Docker ignore kuralları
├── 📄 .railwayignore           # Railway ignore kuralları
├── 📄 .nvmrc                   # Node version (18)
├── 📄 .node-version            # Node version alternatif
├── 📄 env.example              # Environment variables şablonu
│
├── 🚂 Railway Deployment
│   ├── railway.json            # Railway configuration
│   ├── Procfile               # Process tanımları
│   └── nixpacks.toml          # Build configuration
│
├── 📚 Documentation
│   ├── README.md              # Ana dokümantasyon
│   ├── DEPLOYMENT.md          # Deployment rehberi
│   ├── RAILWAY_SETUP.md       # Railway adım adım kurulum
│   ├── QUICKSTART.md          # Hızlı başlangıç
│   ├── API_EXAMPLES.md        # API örnekleri ve curl komutları
│   └── PROJECT_STRUCTURE.md   # Bu dosya
│
├── 🗄️ prisma/
│   ├── schema.prisma          # Database schema (Models, Relations)
│   └── seed.js                # Demo data seeding
│
└── 📂 src/
    │
    ├── 🔧 config/
    │   └── database.js        # Prisma client configuration
    │
    ├── 🛡️ middleware/
    │   ├── auth.js            # JWT authentication middleware
    │   └── errorHandler.js   # Global error handling middleware
    │
    ├── 🛣️ routes/
    │   ├── auth.js            # Authentication endpoints
    │   │                      #   POST /api/auth/register
    │   │                      #   POST /api/auth/login
    │   │                      #   POST /api/auth/refresh
    │   │
    │   ├── tasks.js           # Task management endpoints
    │   │                      # Backlog:
    │   │                      #   GET    /api/tasks/backlog
    │   │                      #   POST   /api/tasks/backlog
    │   │                      #   PUT    /api/tasks/backlog/:id
    │   │                      #   DELETE /api/tasks/backlog/:id
    │   │                      # Active:
    │   │                      #   GET    /api/tasks/active
    │   │                      #   POST   /api/tasks/active
    │   │                      #   PUT    /api/tasks/active/:id
    │   │                      #   PATCH  /api/tasks/active/:id/deadline
    │   │                      #   DELETE /api/tasks/active/:id
    │   │                      # Completed:
    │   │                      #   GET    /api/tasks/completed
    │   │
    │   ├── steps.js           # Step management endpoints
    │   │                      #   GET    /api/tasks/:taskId/steps
    │   │                      #   POST   /api/tasks/:taskId/steps
    │   │                      #   PUT    /api/steps/:id
    │   │                      #   PATCH  /api/steps/:id/complete
    │   │                      #   DELETE /api/steps/:id
    │   │
    │   ├── logs.js            # Activity log endpoints
    │   │                      #   GET    /api/tasks/:taskId/logs
    │   │                      #   POST   /api/tasks/:taskId/logs
    │   │
    │   ├── ai.js              # AI interaction endpoints
    │   │                      #   POST   /api/ai/check-in
    │   │                      #   GET    /api/ai/history
    │   │                      #   POST   /api/ai/analyze-progress
    │   │                      #   POST   /api/ai/motivation
    │   │
    │   └── notifications.js   # Notification endpoints
    │                          #   GET    /api/notifications/settings
    │                          #   PUT    /api/notifications/settings
    │                          #   POST   /api/notifications/test
    │
    ├── 🤖 services/
│   ├── aiService.js       # OpenAI GPT-4 integration
│   │                      # - buildUserContext()
│   │                      # - generateMotivationalMessage()
│   │                      # - checkTriggers()
│   │                      # - calculateStreak()
    │   │
    │   ├── notificationService.js  # Push notification service
    │   │                           # - initializeAPNProvider()
    │   │                           # - sendPushNotification()
    │   │                           # - notifyUser()
    │   │
    │   └── scheduler.js       # Cron job scheduler
    │                          # - scheduleDailyCheckIn() (9:00 AM)
    │                          # - scheduleWeeklyReview() (Sunday 8 PM)
    │                          # - scheduleProgressChecks() (hourly)
    │
    └── 🚀 server.js           # Main Express application
                               # - Middleware setup
                               # - Route registration
                               # - Error handling
                               # - Server initialization
```

## 📊 Database Models (Prisma)

### Users
```prisma
- id: UUID
- email: String (unique)
- password: String (hashed)
- name: String
- createdAt: DateTime
- notificationSettings: JSON
```

### Tasks
```prisma
- id: UUID
- userId: UUID (FK → Users)
- title: String
- description: Text
- status: BACKLOG | ACTIVE | COMPLETED
- deadline: DateTime (nullable)
- priority: LOW | MEDIUM | HIGH
- createdAt: DateTime
- updatedAt: DateTime
- completedAt: DateTime (nullable)
```

### Steps
```prisma
- id: UUID
- taskId: UUID (FK → Tasks)
- title: String
- description: Text
- order: Integer
- completed: Boolean
- completedAt: DateTime (nullable)
- createdAt: DateTime
```

### ActivityLogs
```prisma
- id: UUID
- taskId: UUID (FK → Tasks)
- stepId: UUID (FK → Steps, nullable)
- actionType: CREATED | UPDATED | COMPLETED | COMMENTED
- details: JSON
- timestamp: DateTime
```

### AIInteractions
```prisma
- id: UUID
- userId: UUID (FK → Users)
- taskId: UUID (FK → Tasks, nullable)
- message: Text
- aiResponse: Text
- interactionType: CHECK_IN | MOTIVATION | ANALYSIS
- timestamp: DateTime
```

## 🔄 Request Flow

### Authentication Flow
```
Client → POST /api/auth/login
       → auth.js (route)
       → bcrypt password verify
       → JWT token generate
       ← { user, token }
```

### Protected Endpoint Flow
```
Client → GET /api/tasks/active
       → authenticateToken middleware
       → JWT verify
       → tasks.js (route)
       → Prisma query
       ← { tasks[] }
```

### AI Interaction Flow
```
Client → POST /api/ai/check-in
       → authenticateToken middleware
       → ai.js (route)
       → aiService.buildUserContext()
       → aiService.generateMotivationalMessage()
       → Anthropic Claude API
       → Save to AIInteractions
       ← { message, context }
```

## 🔐 Environment Variables

### Required
```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET           # JWT signing secret
OPENAI_API_KEY       # OpenAI API key
NODE_ENV             # development | production
```

### Optional
```env
PORT                 # Server port (default: 3000)
JWT_EXPIRES_IN       # Token expiry (default: 7d)
OPENAI_MODEL         # OpenAI model (default: gpt-4-turbo-preview)
ENABLE_SCHEDULERS    # Enable cron jobs (default: true)
APNS_KEY            # Apple Push Notifications key
APNS_KEY_ID         # APNs key ID
APNS_TEAM_ID        # APNs team ID
APNS_BUNDLE_ID      # iOS app bundle ID
APNS_PRODUCTION     # APNs environment (true/false)
```

## 🛠️ NPM Scripts

```json
{
  "start": "node src/server.js",              // Production server
  "dev": "nodemon src/server.js",             // Development server
  "prisma:generate": "prisma generate",       // Generate Prisma client
  "prisma:migrate": "prisma migrate deploy",  // Run migrations
  "prisma:seed": "node prisma/seed.js",       // Seed database
  "build": "npm run prisma:generate"          // Build step (Railway)
}
```

## 📦 Key Dependencies

### Core
- `express` - Web framework
- `@prisma/client` - Database ORM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing

### AI & Services
- `openai` - OpenAI GPT-4 integration
- `node-apn` - Apple Push Notifications
- `node-cron` - Task scheduling

### Utilities
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `express-validator` - Request validation

## 🚀 Deployment Files

### railway.json
Railway-specific configuration for build and deploy process.

### Procfile
Process definition for Railway (alternative to railway.json).

### nixpacks.toml
Build configuration for Railway's Nixpacks builder.

### .nvmrc & .node-version
Node.js version specification (18.x) for deployment platforms.

## 📝 Code Organization Principles

### Routes
- Handle HTTP requests/responses
- Input validation with express-validator
- Call services for business logic
- Minimal database logic

### Services
- Reusable business logic
- AI integration
- External API calls
- Complex calculations

### Middleware
- Authentication
- Error handling
- Request logging
- CORS configuration

### Config
- Database connection
- Service initialization
- Environment setup

## 🔄 Data Flow Patterns

### Create Task Example
```
POST /api/tasks/backlog
  ↓
authenticateToken middleware
  ↓
tasks.js route handler
  ↓
Input validation (express-validator)
  ↓
Prisma create task
  ↓
Prisma create activity log
  ↓
Response with created task
```

### AI Check-in Example
```
POST /api/ai/check-in
  ↓
authenticateToken middleware
  ↓
ai.js route handler
  ↓
aiService.buildUserContext(userId)
  ├─ Get active tasks
  ├─ Calculate completion rate
  ├─ Calculate streak
  └─ Format context object
  ↓
aiService.generateMotivationalMessage()
  ├─ Build prompt
  ├─ Call OpenAI API
  └─ Get AI response
  ↓
Save AIInteraction to database
  ↓
Response with AI message
```

## 🧪 Testing Structure

### Manual Testing
- Use `API_EXAMPLES.md` for curl commands
- Postman collection can be generated from examples
- Demo user available after seeding

### Database Testing
- Use `prisma studio` for visual inspection
- Seed script creates realistic demo data
- Migrations track schema changes

## 📈 Scaling Considerations

### Current Architecture
- Single server instance
- Direct database connections
- Synchronous AI calls
- In-process scheduling

### Future Enhancements
- Redis for caching
- Message queue for AI requests
- Separate scheduler service
- Load balancing
- CDN for static assets

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Input validation on all endpoints
- SQL injection prevention (Prisma)
- CORS configuration
- Environment variable management
- User-scoped data access (row-level security in queries)

---

Bu yapı, Railway'e deploy edilmeye hazır, scalable ve maintainable bir backend API sağlar.

✨ **Modern, clean ve production-ready!**

