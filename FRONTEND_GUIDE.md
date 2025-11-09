# 🎨 Frontend Integration Guide

Frontend ekibi için hızlı başlangıç rehberi.

## 🔗 Backend URL

```
Production: https://your-app.railway.app
```

**Replace** `your-app.railway.app` with actual Railway domain!

---

## ⚡ Quick Start

### 1. Test Backend
```bash
curl https://your-app.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Login & Get Token
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@goaltracker.com",
    "password": "demo123456"
  }'
```

Copy the `token` from response.

### 3. Get Active Tasks
```bash
curl https://your-app.railway.app/api/tasks/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 TypeScript Types

```typescript
// User
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Auth Response
interface AuthResponse {
  user: User;
  token: string;
}

// Task Status
type TaskStatus = 'BACKLOG' | 'ACTIVE' | 'COMPLETED';

// Priority
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// Task
interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string | null;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  steps?: Step[];
  _count?: {
    steps: number;
    activityLogs?: number;
  };
  // Only in active tasks:
  completedSteps?: number;
  totalSteps?: number;
  daysRemaining?: number | null;
}

// Step
interface Step {
  id: string;
  taskId: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

// Action Type
type ActionType = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'COMMENTED';

// Activity Log
interface ActivityLog {
  id: string;
  taskId: string;
  stepId: string | null;
  actionType: ActionType;
  details: {
    message: string;
    [key: string]: any;
  };
  timestamp: string;
  step?: {
    id: string;
    title: string;
  };
}

// Interaction Type
type InteractionType = 'CHECK_IN' | 'MOTIVATION' | 'ANALYSIS';

// AI Interaction
interface AIInteraction {
  id: string;
  userId: string;
  taskId: string | null;
  message: string;
  aiResponse: string;
  interactionType: InteractionType;
  timestamp: string;
  task?: {
    id: string;
    title: string;
  } | null;
}

// AI Context
interface AIContext {
  active_tasks: Array<{
    id: string;
    title: string;
    deadline: string | null;
    total_steps: number;
    completed_steps: number;
    days_remaining: number | null;
    last_activity: string;
    priority: Priority;
  }>;
  backlog_count: number;
  weekly_completion_rate: number;
  current_streak: number;
  completed_this_week: number;
}

// Notification Settings
interface NotificationSettings {
  dailyCheckIn: boolean;
  progressAlerts: boolean;
  inactivityAlerts: boolean;
  completionCelebrations: boolean;
  weeklyReview: boolean;
  deviceToken?: string | null;
}

// Error Response
interface ErrorResponse {
  error: string;
  details?: any;
}

// Validation Error
interface ValidationError {
  errors: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}
```

---

## 🔧 API Client Example (Axios)

```typescript
import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://your-app.railway.app';

class APIClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const { data } = await this.api.post('/api/auth/register', { email, password, name });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post('/api/auth/login', { email, password });
    return data;
  }

  async refreshToken(): Promise<{ token: string }> {
    const { data } = await this.api.post('/api/auth/refresh');
    return data;
  }

  // Tasks
  async getBacklogTasks(): Promise<Task[]> {
    const { data } = await this.api.get('/api/tasks/backlog');
    return data;
  }

  async getActiveTasks(): Promise<Task[]> {
    const { data } = await this.api.get('/api/tasks/active');
    return data;
  }

  async getCompletedTasks(): Promise<Task[]> {
    const { data } = await this.api.get('/api/tasks/completed');
    return data;
  }

  async createBacklogTask(title: string, description: string, priority: Priority = 'MEDIUM'): Promise<Task> {
    const { data } = await this.api.post('/api/tasks/backlog', { title, description, priority });
    return data;
  }

  async moveToActive(taskId: string, deadline: string): Promise<Task> {
    const { data } = await this.api.post('/api/tasks/active', { taskId, deadline });
    return data;
  }

  async updateTask(taskId: string, status: TaskStatus, updates: Partial<Task>): Promise<Task> {
    const endpoint = status === 'BACKLOG' ? `/api/tasks/backlog/${taskId}` : `/api/tasks/active/${taskId}`;
    const { data } = await this.api.put(endpoint, updates);
    return data;
  }

  async deleteTask(taskId: string, status: TaskStatus): Promise<{ message: string }> {
    const endpoint = status === 'BACKLOG' ? `/api/tasks/backlog/${taskId}` : `/api/tasks/active/${taskId}`;
    const { data } = await this.api.delete(endpoint);
    return data;
  }

  // Steps
  async getTaskSteps(taskId: string): Promise<Step[]> {
    const { data } = await this.api.get(`/api/tasks/${taskId}/steps`);
    return data;
  }

  async createStep(taskId: string, title: string, description: string, order?: number): Promise<Step> {
    const { data } = await this.api.post(`/api/tasks/${taskId}/steps`, { title, description, order });
    return data;
  }

  async updateStep(stepId: string, updates: Partial<Step>): Promise<Step> {
    const { data } = await this.api.put(`/api/steps/${stepId}`, updates);
    return data;
  }

  async toggleStepComplete(stepId: string): Promise<Step> {
    const { data } = await this.api.patch(`/api/steps/${stepId}/complete`);
    return data;
  }

  async deleteStep(stepId: string): Promise<{ message: string }> {
    const { data } = await this.api.delete(`/api/steps/${stepId}`);
    return data;
  }

  // Activity Logs
  async getTaskLogs(taskId: string): Promise<ActivityLog[]> {
    const { data } = await this.api.get(`/api/tasks/${taskId}/logs`);
    return data;
  }

  async addComment(taskId: string, message: string, stepId?: string): Promise<ActivityLog> {
    const { data } = await this.api.post(`/api/tasks/${taskId}/logs`, { message, stepId });
    return data;
  }

  // AI
  async checkIn(): Promise<{ message: string; context: AIContext; interactionId: string }> {
    const { data } = await this.api.post('/api/ai/check-in');
    return data;
  }

  async getAIHistory(limit = 20): Promise<AIInteraction[]> {
    const { data } = await this.api.get(`/api/ai/history?limit=${limit}`);
    return data;
  }

  async analyzeProgress(taskId?: string): Promise<{ analysis: string; context: any; interactionId: string }> {
    const { data } = await this.api.post('/api/ai/analyze-progress', taskId ? { taskId } : {});
    return data;
  }

  async getMotivation(): Promise<{ message: string; interactionId: string }> {
    const { data } = await this.api.post('/api/ai/motivation');
    return data;
  }

  // Notifications
  async getNotificationSettings(): Promise<NotificationSettings> {
    const { data } = await this.api.get('/api/notifications/settings');
    return data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data } = await this.api.put('/api/notifications/settings', settings);
    return data;
  }

  // Health
  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    const { data } = await this.api.get('/health');
    return data;
  }
}

export const apiClient = new APIClient();
```

---

## 🎨 UI Component Examples

### Login Form
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await apiClient.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    setError('Invalid email or password');
  }
};
```

### Task List
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const data = await apiClient.getActiveTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchTasks();
}, []);
```

### Complete Step (with Optimistic Update)
```typescript
const handleToggleStep = async (stepId: string) => {
  // Optimistic update
  setSteps(steps.map(step => 
    step.id === stepId 
      ? { ...step, completed: !step.completed } 
      : step
  ));

  try {
    const updatedStep = await apiClient.toggleStepComplete(stepId);
    // Update with server response
    setSteps(steps.map(step => 
      step.id === stepId ? updatedStep : step
    ));
  } catch (error) {
    // Revert on error
    setSteps(steps.map(step => 
      step.id === stepId 
        ? { ...step, completed: !step.completed } 
        : step
    ));
    console.error('Failed to toggle step:', error);
  }
};
```

### AI Check-in Button
```typescript
const [aiMessage, setAiMessage] = useState('');
const [loading, setLoading] = useState(false);

const handleCheckIn = async () => {
  setLoading(true);
  try {
    const response = await apiClient.checkIn();
    setAiMessage(response.message);
  } catch (error) {
    console.error('Check-in failed:', error);
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleCheckIn} disabled={loading}>
    {loading ? 'Getting AI feedback...' : 'Daily Check-in'}
  </button>
);
```

---

## 📱 Recommended Libraries

### React/React Native
```bash
npm install axios
npm install date-fns  # Date formatting
npm install @tanstack/react-query  # Data fetching & caching
```

### State Management (optional)
```bash
npm install zustand  # Simple state management
# or
npm install redux @reduxjs/toolkit
```

---

## 🎯 Key Features to Implement

### Must-Have (MVP)
- [ ] Login/Register
- [ ] Active tasks list with progress bars
- [ ] Backlog tasks list
- [ ] Task detail with steps
- [ ] Create/edit/delete tasks
- [ ] Toggle step completion
- [ ] AI check-in button
- [ ] Basic dashboard

### Nice-to-Have
- [ ] AI chat history
- [ ] Task progress analysis
- [ ] Completed tasks archive
- [ ] Activity timeline
- [ ] Notification settings
- [ ] Dark mode
- [ ] Search/filter tasks

### Future
- [ ] Real-time updates (WebSocket)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Task templates
- [ ] Collaboration features

---

## 🐛 Common Issues

### CORS Error
Backend needs to add your domain to CORS whitelist.
Contact backend team with your domain.

### 401 Unauthorized
Token expired or invalid. Clear localStorage and re-login.

### AI Requests Slow
GPT-4 responses take 2-5 seconds. Show loading state.

### Date Format Issues
All dates are ISO 8601. Use `date-fns` or `dayjs` for formatting.

---

## 🚀 Testing

Test with demo account:
```
Email: demo@goaltracker.com
Password: demo123456
```

Demo account has sample data (tasks, steps, AI history).

---

## 📞 Contact Backend Team

Questions? Issues?
- Repository: https://github.com/egeaydin1/future
- API Docs: `API_DOCUMENTATION.md`
- Examples: `API_EXAMPLES.md`

---

**Good luck building! 🎉**

