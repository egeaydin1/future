# 📡 Goal Tracker Pro - API Documentation for Frontend

## 🔗 Base URL

```
Production: https://your-app.railway.app
Development: http://localhost:3000
```

---

## 🔐 Authentication

Tüm endpoint'ler (auth hariç) JWT token gerektirir:

```
Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📋 API Endpoints Overview

### Authentication
- POST `/api/auth/register` - Yeni kullanıcı kaydı
- POST `/api/auth/login` - Giriş yap
- POST `/api/auth/refresh` - Token yenile

### Tasks - Backlog (Tarihsiz)
- GET `/api/tasks/backlog` - Backlog görevleri listele
- POST `/api/tasks/backlog` - Yeni backlog görevi oluştur
- PUT `/api/tasks/backlog/:id` - Backlog görevi güncelle
- DELETE `/api/tasks/backlog/:id` - Backlog görevini sil

### Tasks - Active (Deadline'lı)
- GET `/api/tasks/active` - Aktif görevleri listele
- POST `/api/tasks/active` - Backlog'dan active'e taşı (deadline ekle)
- PUT `/api/tasks/active/:id` - Aktif görevi güncelle
- PATCH `/api/tasks/active/:id/deadline` - Deadline güncelle
- DELETE `/api/tasks/active/:id` - Aktif görevi sil

### Tasks - Completed
- GET `/api/tasks/completed` - Tamamlanan görevleri listele

### Steps (Alt Görevler)
- GET `/api/tasks/:taskId/steps` - Görevin adımlarını listele
- POST `/api/tasks/:taskId/steps` - Yeni adım ekle
- PUT `/api/steps/:id` - Adım güncelle
- PATCH `/api/steps/:id/complete` - Adım tamamla/geri al (toggle)
- DELETE `/api/steps/:id` - Adım sil

### Activity Logs
- GET `/api/tasks/:taskId/logs` - Görev aktivite logları
- POST `/api/tasks/:taskId/logs` - Yorum/not ekle

### AI Features
- POST `/api/ai/check-in` - Manuel AI check-in
- GET `/api/ai/history` - AI konuşma geçmişi
- POST `/api/ai/analyze-progress` - İlerleme analizi (genel veya task bazlı)
- POST `/api/ai/motivation` - Motivasyon mesajı al

### Notifications
- GET `/api/notifications/settings` - Bildirim ayarları
- PUT `/api/notifications/settings` - Bildirim ayarlarını güncelle
- POST `/api/notifications/test` - Test bildirimi gönder

### Health Check
- GET `/health` - API sağlık kontrolü
- GET `/` - API bilgisi

---

## 📝 Detailed Endpoints

---

## 1. 🔐 Authentication

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-11-09T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- `email`: Valid email format
- `password`: Minimum 6 characters
- `name`: Required, non-empty

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-11-09T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Refresh Token
```http
POST /api/auth/refresh
Headers: Authorization: Bearer <OLD_TOKEN>
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. 📋 Tasks - Backlog (Tarihsiz Görevler)

### Get Backlog Tasks
```http
GET /api/tasks/backlog
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "Learn TypeScript",
    "description": "Master TypeScript basics",
    "status": "BACKLOG",
    "deadline": null,
    "priority": "MEDIUM",
    "createdAt": "2024-11-09T12:00:00.000Z",
    "updatedAt": "2024-11-09T12:00:00.000Z",
    "completedAt": null,
    "steps": [
      {
        "id": "uuid",
        "title": "Read documentation",
        "description": "Go through official docs",
        "order": 0,
        "completed": false,
        "completedAt": null,
        "createdAt": "2024-11-09T12:00:00.000Z"
      }
    ],
    "_count": {
      "steps": 3
    }
  }
]
```

---

### Create Backlog Task
```http
POST /api/tasks/backlog
Headers: Authorization: Bearer <TOKEN>
```

**Request Body:**
```json
{
  "title": "Build Portfolio Website",
  "description": "Create a professional portfolio",
  "priority": "HIGH"
}
```

**Fields:**
- `title` (required): String
- `description` (required): String
- `priority` (optional): "LOW" | "MEDIUM" | "HIGH" (default: "MEDIUM")

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Build Portfolio Website",
  "description": "Create a professional portfolio",
  "status": "BACKLOG",
  "deadline": null,
  "priority": "HIGH",
  "createdAt": "2024-11-09T12:00:00.000Z",
  "updatedAt": "2024-11-09T12:00:00.000Z",
  "completedAt": null,
  "steps": []
}
```

---

### Update Backlog Task
```http
PUT /api/tasks/backlog/:id
Headers: Authorization: Bearer <TOKEN>
```

**Request Body (all optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "LOW"
}
```

**Response (200):** Updated task object

---

### Delete Backlog Task
```http
DELETE /api/tasks/backlog/:id
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## 3. 🎯 Tasks - Active (Deadline'lı Görevler)

### Get Active Tasks
```http
GET /api/tasks/active
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Complete Project",
    "description": "Finish the main project",
    "status": "ACTIVE",
    "deadline": "2024-12-31T23:59:59.000Z",
    "priority": "HIGH",
    "createdAt": "2024-11-09T12:00:00.000Z",
    "updatedAt": "2024-11-09T12:00:00.000Z",
    "completedAt": null,
    "steps": [...],
    "completedSteps": 2,
    "totalSteps": 5,
    "daysRemaining": 52,
    "_count": {
      "steps": 5,
      "activityLogs": 10
    }
  }
]
```

**Extra Fields:**
- `completedSteps`: Number - Tamamlanan adım sayısı
- `totalSteps`: Number - Toplam adım sayısı
- `daysRemaining`: Number - Kalan gün sayısı

---

### Move to Active (Backlog → Active)
```http
POST /api/tasks/active
Headers: Authorization: Bearer <TOKEN>
```

**Request Body:**
```json
{
  "taskId": "uuid",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

**Fields:**
- `taskId` (required): Backlog task UUID
- `deadline` (required): ISO 8601 date string

**Response (200):** Updated task with status "ACTIVE"

---

### Update Active Task
```http
PUT /api/tasks/active/:id
Headers: Authorization: Bearer <TOKEN>
```

**Request Body (all optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "HIGH"
}
```

---

### Update Deadline
```http
PATCH /api/tasks/active/:id/deadline
Headers: Authorization: Bearer <TOKEN>
```

**Request Body:**
```json
{
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

---

### Delete Active Task
```http
DELETE /api/tasks/active/:id
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## 4. ✅ Tasks - Completed

### Get Completed Tasks
```http
GET /api/tasks/completed
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Completed Task",
    "status": "COMPLETED",
    "completedAt": "2024-11-09T12:00:00.000Z",
    "steps": [...],
    "_count": {
      "steps": 5
    }
  }
]
```

**Note:** Returns last 50 completed tasks

---

## 5. 📝 Steps (Alt Görevler)

### Get Task Steps
```http
GET /api/tasks/:taskId/steps
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "taskId": "uuid",
    "title": "Research frameworks",
    "description": "Compare React, Vue, Angular",
    "order": 0,
    "completed": false,
    "completedAt": null,
    "createdAt": "2024-11-09T12:00:00.000Z"
  }
]
```

---

### Create Step
```http
POST /api/tasks/:taskId/steps
Headers: Authorization: Bearer <TOKEN>
```

**Request Body:**
```json
{
  "title": "Design database schema",
  "description": "Create ER diagram and tables",
  "order": 0
}
```

**Fields:**
- `title` (required): String
- `description` (required): String
- `order` (optional): Number - Auto-incremented if not provided

**Response (201):** Created step object

---

### Update Step
```http
PUT /api/steps/:id
Headers: Authorization: Bearer <TOKEN>
```

**Request Body (all optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "order": 1
}
```

---

### Toggle Step Completion
```http
PATCH /api/steps/:id/complete
Headers: Authorization: Bearer <TOKEN>
```

**No body required**

**Response (200):** Updated step object

**Note:** 
- Toggles `completed` field (false → true, true → false)
- Sets `completedAt` timestamp when completed
- Auto-completes parent task when all steps are done

---

### Delete Step
```http
DELETE /api/steps/:id
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "message": "Step deleted successfully"
}
```

---

## 6. 📊 Activity Logs

### Get Task Logs
```http
GET /api/tasks/:taskId/logs
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "taskId": "uuid",
    "stepId": "uuid",
    "actionType": "COMPLETED",
    "details": {
      "message": "Step completed: Design wireframes"
    },
    "timestamp": "2024-11-09T12:00:00.000Z",
    "step": {
      "id": "uuid",
      "title": "Design wireframes"
    }
  }
]
```

**Action Types:**
- `CREATED` - Task/step created
- `UPDATED` - Task/step updated
- `COMPLETED` - Task/step completed
- `COMMENTED` - User comment/note

**Note:** Returns last 100 logs

---

### Add Comment/Note
```http
POST /api/tasks/:taskId/logs
Headers: Authorization: Bearer <TOKEN>
```

**Request Body:**
```json
{
  "message": "Made good progress today!",
  "stepId": "uuid"
}
```

**Fields:**
- `message` (required): String
- `stepId` (optional): UUID - Link to specific step

**Response (201):** Created log object

---

## 7. 🤖 AI Features

### Manual Check-in
```http
POST /api/ai/check-in
Headers: Authorization: Bearer <TOKEN>
```

**No body required**

**Response (200):**
```json
{
  "message": "Hey John! 👋\n\nGreat to see you checking in today! You're currently working on 3 active tasks...",
  "context": {
    "active_tasks": [
      {
        "id": "uuid",
        "title": "Build Portfolio",
        "deadline": "2024-12-31T23:59:59.000Z",
        "total_steps": 5,
        "completed_steps": 2,
        "days_remaining": 52,
        "last_activity": "2024-11-09T12:00:00.000Z",
        "priority": "HIGH"
      }
    ],
    "backlog_count": 5,
    "weekly_completion_rate": 0.75,
    "current_streak": 3,
    "completed_this_week": 2
  },
  "interactionId": "uuid"
}
```

---

### Get AI History
```http
GET /api/ai/history?limit=20
Headers: Authorization: Bearer <TOKEN>
```

**Query Parameters:**
- `limit` (optional): Number (default: 20)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "taskId": null,
    "message": "Daily check-in",
    "aiResponse": "Hey John! Great progress...",
    "interactionType": "CHECK_IN",
    "timestamp": "2024-11-09T12:00:00.000Z",
    "task": null
  }
]
```

**Interaction Types:**
- `CHECK_IN` - Daily/manual check-in
- `MOTIVATION` - Motivation message
- `ANALYSIS` - Progress analysis

---

### Analyze Progress
```http
POST /api/ai/analyze-progress
Headers: Authorization: Bearer <TOKEN>
```

**Request Body (optional):**
```json
{
  "taskId": "uuid"
}
```

**Fields:**
- `taskId` (optional): UUID - Analyze specific task, or omit for overall analysis

**Response (200):**
```json
{
  "analysis": "Based on your current progress, you're doing well! You've completed 2 out of 5 steps...",
  "context": {
    "task": {
      "title": "Build Portfolio",
      "description": "...",
      "completedSteps": 2,
      "totalSteps": 5,
      "daysRemaining": 52,
      "priority": "HIGH",
      "recentActivity": [...]
    }
  },
  "interactionId": "uuid"
}
```

---

### Get Motivation
```http
POST /api/ai/motivation
Headers: Authorization: Bearer <TOKEN>
```

**No body required**

**Response (200):**
```json
{
  "message": "You're making amazing progress! Keep up the great work! 💪",
  "interactionId": "uuid"
}
```

---

## 8. 🔔 Notifications

### Get Notification Settings
```http
GET /api/notifications/settings
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "dailyCheckIn": true,
  "progressAlerts": true,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "weeklyReview": true,
  "deviceToken": null
}
```

---

### Update Notification Settings
```http
PUT /api/notifications/settings
Headers: Authorization: Bearer <TOKEN>
```

**Request Body (all optional):**
```json
{
  "dailyCheckIn": false,
  "progressAlerts": true,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "weeklyReview": false,
  "deviceToken": "apns-device-token"
}
```

**Response (200):** Updated settings object

---

### Test Notification
```http
POST /api/notifications/test
Headers: Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "success": false,
  "message": "Failed to send notification",
  "error": "APNs not configured - notifications logged only"
}
```

**Note:** APNs currently disabled. Notifications are logged but not sent.

---

## 9. 🏥 Health & Info

### Health Check
```http
GET /health
```

**No authentication required**

**Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-11-09T12:00:00.000Z"
}
```

---

### API Info
```http
GET /
```

**Response (200):**
```json
{
  "status": "ok",
  "message": "Goal Tracker Pro API",
  "version": "1.0.0"
}
```

---

## 🔴 Error Responses

### Standard Error Format
```json
{
  "error": "Error message description"
}
```

### Validation Errors
```json
{
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (valid token but no access)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## 📱 UI Implementation Notes

### Task Status Flow
```
BACKLOG → ACTIVE → COMPLETED
```

1. **BACKLOG**: No deadline, planning phase
2. **ACTIVE**: Has deadline, being worked on
3. **COMPLETED**: All steps done

### Priority Levels
```
LOW | MEDIUM | HIGH
```

Show with colors:
- **HIGH**: Red/Orange
- **MEDIUM**: Yellow
- **LOW**: Green/Blue

### Date Handling
All dates are ISO 8601 format:
```
"2024-11-09T12:00:00.000Z"
```

Use JavaScript `Date` object or libraries like `date-fns`, `dayjs`

### Step Progress
Calculate percentage:
```javascript
const progress = (completedSteps / totalSteps) * 100;
```

### Days Remaining
Show urgency:
- < 3 days: RED (urgent)
- 3-7 days: ORANGE (soon)
- 7-14 days: YELLOW (upcoming)
- > 14 days: GREEN (plenty of time)

### Real-time Updates
Consider implementing:
- Auto-refresh active tasks every 30s
- Optimistic UI updates
- Loading states for AI requests (can take 2-5s)

### AI Response Display
- Show loading spinner for AI requests
- Display responses in chat-like format
- Allow copying AI responses
- Show timestamp for each interaction

---

## 🎨 Recommended UI Components

### Pages/Screens
1. **Login/Register** - Auth forms
2. **Dashboard** - Overview (active tasks, progress, AI widget)
3. **Backlog** - List of tarihsiz görevler
4. **Active Tasks** - List of deadline'lı görevler
5. **Task Detail** - Steps, logs, edit, AI analysis
6. **AI Chat** - Check-in, motivation, history
7. **Settings** - Notifications, profile

### Key Components
- **TaskCard** - Show task with progress bar
- **StepList** - Checkable step items
- **ProgressBar** - Visual progress indicator
- **AIMessage** - AI response bubble
- **PriorityBadge** - Colored priority indicator
- **DeadlineCountdown** - Days remaining with color
- **ActivityFeed** - Timeline of logs

---

## 💾 Local Storage Suggestions

Store in localStorage/AsyncStorage:
```javascript
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

Clear on logout or 401 error.

---

## 🔄 Recommended API Flow

### App Initialization
1. Check localStorage for token
2. If token exists → Validate with `/health` or any protected endpoint
3. If valid → Load dashboard
4. If invalid → Redirect to login

### After Login
1. Store token and user in localStorage
2. Fetch active tasks
3. Fetch backlog count
4. Optional: Trigger AI check-in

### Creating Task
1. POST to `/api/tasks/backlog`
2. Optimistically add to UI
3. On success → Confirm
4. On error → Revert and show error

### Completing Step
1. PATCH to `/api/steps/:id/complete`
2. Optimistically toggle UI
3. On success → Check if task auto-completed
4. On error → Revert

---

## 🚀 Demo Credentials

Test the API with:
```json
{
  "email": "demo@goaltracker.com",
  "password": "demo123456"
}
```

Demo user already has sample tasks and steps.

---

## 📞 Support

- **API Issues**: Check `/health` endpoint
- **401 Errors**: Token expired, re-login
- **CORS Issues**: Ensure backend has correct CORS config
- **AI Slow**: GPT-4 responses can take 2-5 seconds

---

**Base URL:** `https://your-app.railway.app`

**Full documentation:** Check `README.md` and `API_EXAMPLES.md` in the repository.

---

Güncellemeler için repository'yi takip edin: https://github.com/egeaydin1/future

