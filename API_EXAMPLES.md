# 📡 API Examples

Goal Tracker Pro API'sini kullanmak için örnek curl komutları.

## 🔐 Authentication

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Tasks - Backlog (Tarihsiz Görevler)

### Get All Backlog Tasks

```bash
curl -X GET http://localhost:3000/api/tasks/backlog \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Backlog Task

```bash
curl -X POST http://localhost:3000/api/tasks/backlog \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn TypeScript",
    "description": "Study TypeScript fundamentals and advanced concepts",
    "priority": "MEDIUM"
  }'
```

**Priorities:** `LOW`, `MEDIUM`, `HIGH`

### Update Backlog Task

```bash
curl -X PUT http://localhost:3000/api/tasks/backlog/TASK_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Master TypeScript",
    "priority": "HIGH"
  }'
```

### Delete Backlog Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/backlog/TASK_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Tasks - Active (Deadline'lı Görevler)

### Get All Active Tasks

```bash
curl -X GET http://localhost:3000/api/tasks/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Move Task to Active (Add Deadline)

```bash
curl -X POST http://localhost:3000/api/tasks/active \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "BACKLOG_TASK_UUID",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

### Update Active Task

```bash
curl -X PUT http://localhost:3000/api/tasks/active/TASK_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "priority": "HIGH"
  }'
```

### Update Deadline

```bash
curl -X PATCH http://localhost:3000/api/tasks/active/TASK_UUID/deadline \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

### Delete Active Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/active/TASK_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Completed Tasks

```bash
curl -X GET http://localhost:3000/api/tasks/completed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Steps (Adımlar)

### Get All Steps for a Task

```bash
curl -X GET http://localhost:3000/api/tasks/TASK_UUID/steps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Step

```bash
curl -X POST http://localhost:3000/api/tasks/TASK_UUID/steps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research frameworks",
    "description": "Compare React, Vue, and Angular",
    "order": 0
  }'
```

### Update Step

```bash
curl -X PUT http://localhost:3000/api/steps/STEP_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated step title",
    "description": "Updated description",
    "order": 1
  }'
```

### Toggle Step Completion

```bash
curl -X PATCH http://localhost:3000/api/steps/STEP_UUID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Step

```bash
curl -X DELETE http://localhost:3000/api/steps/STEP_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Activity Logs

### Get Task Logs

```bash
curl -X GET http://localhost:3000/api/tasks/TASK_UUID/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Comment/Note

```bash
curl -X POST http://localhost:3000/api/tasks/TASK_UUID/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Made good progress today!",
    "stepId": "STEP_UUID_OPTIONAL"
  }'
```

---

## 🤖 AI Interactions

### Manual Check-in

```bash
curl -X POST http://localhost:3000/api/ai/check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Hey John! 👋\n\nGreat to see you checking in...",
  "context": {
    "active_tasks": [...],
    "backlog_count": 5,
    "weekly_completion_rate": 0.75,
    "current_streak": 3
  },
  "interactionId": "uuid"
}
```

### Get AI History

```bash
curl -X GET "http://localhost:3000/api/ai/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Analyze Progress (Overall)

```bash
curl -X POST http://localhost:3000/api/ai/analyze-progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Analyze Specific Task

```bash
curl -X POST http://localhost:3000/api/ai/analyze-progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_UUID"
  }'
```

### Get Motivation

```bash
curl -X POST http://localhost:3000/api/ai/motivation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔔 Notifications

### Get Notification Settings

```bash
curl -X GET http://localhost:3000/api/notifications/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "dailyCheckIn": true,
  "progressAlerts": true,
  "inactivityAlerts": true,
  "completionCelebrations": true,
  "weeklyReview": true,
  "deviceToken": "apns-device-token"
}
```

### Update Notification Settings

```bash
curl -X PUT http://localhost:3000/api/notifications/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dailyCheckIn": true,
    "progressAlerts": false,
    "inactivityAlerts": true,
    "completionCelebrations": true,
    "weeklyReview": false,
    "deviceToken": "new-apns-device-token"
  }'
```

### Test Push Notification

```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏥 Health & Status

### Health Check

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Root

```bash
curl -X GET http://localhost:3000/
```

**Response:**
```json
{
  "status": "ok",
  "message": "Goal Tracker Pro API",
  "version": "1.0.0"
}
```

---

## 🔄 Complete Workflow Example

### 1. Register & Login

```bash
# Register
TOKEN=$(curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "workflow@example.com",
    "password": "test123456",
    "name": "Workflow User"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Create Backlog Task

```bash
TASK=$(curl -X POST http://localhost:3000/api/tasks/backlog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Mobile App",
    "description": "Create a React Native mobile application",
    "priority": "HIGH"
  }' | jq -r '.id')

echo "Task ID: $TASK"
```

### 3. Add Steps

```bash
# Step 1
STEP1=$(curl -X POST http://localhost:3000/api/tasks/$TASK/steps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Set up development environment",
    "description": "Install React Native and dependencies",
    "order": 0
  }' | jq -r '.id')

# Step 2
STEP2=$(curl -X POST http://localhost:3000/api/tasks/$TASK/steps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design UI mockups",
    "description": "Create Figma designs for all screens",
    "order": 1
  }' | jq -r '.id')

echo "Created steps: $STEP1, $STEP2"
```

### 4. Move to Active with Deadline

```bash
curl -X POST http://localhost:3000/api/tasks/active \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"taskId\": \"$TASK\",
    \"deadline\": \"2024-12-31T23:59:59.000Z\"
  }"
```

### 5. Complete First Step

```bash
curl -X PATCH http://localhost:3000/api/steps/$STEP1/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get AI Check-in

```bash
curl -X POST http://localhost:3000/api/ai/check-in \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
```

---

## 📱 Postman Collection

İsterseniz bu örnekleri Postman Collection olarak import edebilirsiniz:

1. Postman'i açın
2. Import → Raw text
3. Bu dosyadaki curl komutlarını yapıştırın
4. Postman otomatik convert edecek

Ya da environment variable'lar ile:

- `{{baseUrl}}`: `http://localhost:3000`
- `{{token}}`: Login'den alınan JWT token

---

## 🧪 Testing Tips

### jq ile JSON Parse

```bash
# Token'ı otomatik al
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@goaltracker.com","password":"demo123456"}' \
  | jq -r '.token')
```

### Watch ile Otomatik Refresh

```bash
# Her 2 saniyede health check
watch -n 2 'curl -s http://localhost:3000/health | jq'
```

### Response Time Ölçme

```bash
curl -w "\nTime: %{time_total}s\n" \
  -X GET http://localhost:3000/api/tasks/active \
  -H "Authorization: Bearer $TOKEN"
```

---

İyi testler! 🚀

