
import { Activity, Ticket, Meeting, Task } from './types';

// Corrected mockTickets with proper reporter and timestamp fields
export const mockTickets: Ticket[] = [
  {
    id: "t1",
    title: "Server outage in production",
    description: "Customers are experiencing downtime with the main application server",
    status: "open",
    priority: "high",
    created_at: "2023-05-10T10:30:00Z",
    updated_at: "2023-05-10T11:45:00Z",
    reporter: "John Doe",
    created_by: "John Doe",
    customer: {
      name: "Acme Corp",
      company: "Acme Corporation"
    },
    assignee: "Jane Smith",
    tags: ["critical", "production", "server"],
    user_id: "user-1"
  },
  {
    id: "t2",
    title: "Login page error",
    description: "Users are unable to log in with correct credentials",
    status: "in-progress",
    priority: "medium",
    created_at: "2023-05-12T09:15:00Z",
    updated_at: "2023-05-12T14:20:00Z",
    reporter: "Emma Wilson",
    created_by: "Emma Wilson",
    customer: {
      name: "TechCo",
      company: "Technology Company"
    },
    assignee: "Bob Johnson",
    tags: ["authentication", "frontend", "bug"],
    user_id: "user-2"
  },
  {
    id: "t3",
    title: "Data export feature request",
    description: "Client needs ability to export data in CSV format",
    status: "open",
    priority: "low",
    created_at: "2023-05-15T13:00:00Z",
    updated_at: "2023-05-15T13:00:00Z",
    reporter: "Sam Brown",
    created_by: "Sam Brown",
    customer: {
      name: "DataFirm",
      company: "Data Analysis Firm",
      email: "contact@datafirm.com"
    },
    assignee: "Alice Green",
    tags: ["feature", "export", "csv"],
    user_id: "user-3"
  }
];

// Mock upcoming meetings
export const upcomingMeetings: Meeting[] = [
  {
    id: "m1",
    title: "Client onboarding session",
    date: "2023-05-20T10:00:00Z",
    duration: 60,
    client_name: "New Tech Inc",
    client_id: "c1",
    created_by: "user-1",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    agenda: "Discuss implementation timeline and requirements",
    notes: "",
    attendees: [
      { id: "a1", name: "John Doe", email: "john@example.com", status: "accepted" },
      { id: "a2", name: "Jane Smith", email: "jane@example.com", status: "pending" },
      { id: "a3", name: "Client Rep", email: "client@newtech.com", status: "accepted" }
    ]
  },
  {
    id: "m2",
    title: "Weekly team sync",
    date: "2023-05-17T14:30:00Z",
    duration: 30,
    client_name: "Internal",
    client_id: "",
    created_by: "user-2",
    meeting_link: "https://meet.zoom.us/123456789",
    agenda: "Project updates and blockers",
    notes: ""
  }
];

// Mock critical alerts
export const criticalAlerts = [
  {
    id: "a1",
    title: "Server CPU usage above 90%",
    description: "High CPU utilization detected on production server",
    severity: "critical",
    timestamp: "2023-05-16T08:45:00Z",
    status: "active",
    clientName: "Acme Corp"
  },
  {
    id: "a2",
    title: "Database connection errors",
    description: "Multiple failed connection attempts to primary database",
    severity: "high",
    timestamp: "2023-05-16T07:30:00Z",
    status: "investigating",
    clientName: "TechCo"
  }
];

// Mock recent activities
export const recentActivities: Activity[] = [
  {
    id: "act1",
    userId: "user-1",
    type: "comment",
    entityType: "task",
    entityId: "t1",
    content: "Added a new comment on critical server issue",
    timestamp: "2023-05-16T10:15:00Z"
  },
  {
    id: "act2",
    userId: "user-2",
    type: "status_change",
    entityType: "task",
    entityId: "t2",
    content: "Changed status from 'open' to 'in-progress'",
    timestamp: "2023-05-16T09:45:00Z"
  },
  {
    id: "act3",
    userId: "user-3",
    type: "created",
    entityType: "meeting",
    entityId: "m1",
    content: "Scheduled client onboarding meeting",
    timestamp: "2023-05-15T16:30:00Z"
  }
];

// Mock tasks for Notion task search
export const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Implement authentication flow",
    description: "Create login, signup, and password reset pages",
    status: "in-progress",
    priority: "high",
    due_date: "2023-06-01T00:00:00Z",
    assignee_id: "user-1",
    reporter_id: "user-2",
    user_id: "user-2",
    parent_task_id: null,
    created_at: "2023-05-10T09:00:00Z",
    updated_at: "2023-05-14T11:30:00Z",
    tags: ["frontend", "authentication"]
  },
  {
    id: "task2",
    title: "Database schema design",
    description: "Design and document database schema for the new project",
    status: "completed",
    priority: "medium",
    due_date: "2023-05-15T00:00:00Z",
    assignee_id: "user-3",
    reporter_id: "user-2",
    user_id: "user-2",
    parent_task_id: null,
    created_at: "2023-05-05T14:20:00Z",
    updated_at: "2023-05-12T16:45:00Z",
    tags: ["database", "design"]
  }
];
