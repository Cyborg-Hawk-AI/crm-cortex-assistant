import { Activity, Message, Note, Ticket, Communication } from "./types";
import { 
  addDays, 
  addHours, 
  addMinutes, 
  addWeeks, 
  subDays, 
  subHours, 
  subMinutes
} from "date-fns";

const now = new Date();

// Create some sample communications
const sampleCommunications: Partial<Communication>[] = [
  {
    id: "comm-1",
    from: "John Doe (Customer)",
    message: "Just checking on the status of this ticket. Any updates?",
    date: subDays(now, 1),
    content: "Just checking on the status of this ticket. Any updates?",
    sender: "customer",
    type: "email",
    title: "Status Update",
    contact_id: "contact-123",
    contact_name: "John Doe",
    created_by: "user-123"
  },
  {
    id: "comm-2",
    from: "Sarah Johnson (Support)",
    message: "We're currently working on gathering the necessary documentation. I'll update you with progress by tomorrow.",
    date: subHours(now, 20),
    content: "We're currently working on gathering the necessary documentation. I'll update you with progress by tomorrow.",
    sender: "support"
  },
  {
    id: "comm-3",
    from: "John Doe (Customer)",
    message: "Thanks for the update. Looking forward to seeing the documentation.",
    date: subHours(now, 18),
    content: "Thanks for the update. Looking forward to seeing the documentation.",
    sender: "customer"
  }
];

export const mockTicket: Ticket = {
  id: "TICKET-1234",
  title: "Update product roadmap with new Q3 initiatives",
  description: "We need to update our roadmap with the new initiatives decided during our last planning session.",
  status: "In Progress",
  priority: "High",
  assignee_id: "user-456",
  reporter_id: "user-789",
  created_at: new Date("2023-05-15T14:32:00Z"),
  updated_at: new Date("2023-05-17T09:15:00Z"),
  created_by: "user-123",
  user_id: "user-123",
  parent_task_id: null,
  tags: ["roadmap", "planning", "product"],
  // Supporting legacy properties while keeping the required ones
  assignee: "Sarah Johnson",
  reporter: "Product Manager",
  created: new Date("2023-05-15T14:32:00Z"),
  updated: new Date("2023-05-17T09:15:00Z"),
  comments: [],
  related: ["DOC-456", "MEET-789"],
  customer: {
    name: "John Doe",
    company: "Acme Corp",
    email: "john@acmecorp.com"
  },
  updatedAt: subHours(now, 2),
  lastStatusUpdate: "Client has requested additional documentation on the Q3 initiatives. Working on supplementary materials.",
  summary: "Quarterly planning document requires updates to reflect the new strategic focus on AI integration and cloud migration efforts.",
  actionItems: [
    "Prepare draft timeline for AI features",
    "Gather feedback from stakeholders",
    "Update resource allocation plan",
    "Schedule follow-up review meeting"
  ],
  meetingDate: addDays(now, 2),
  meetingAttendees: ["John Doe", "Sarah Johnson", "Alex Wong", "Maria Garcia"],
  communications: sampleCommunications
};

export const mockTickets: Ticket[] = [
  mockTicket,
  {
    id: "TICKET-1235",
    title: "Critical: Cloud infrastructure outage affecting production",
    description: "Multiple clients reporting inability to access application services.",
    status: "Urgent",
    priority: "Critical",
    assignee_id: "user-456",
    reporter_id: "user-789",
    created_at: new Date("2023-05-18T08:32:00Z"),
    updated_at: new Date("2023-05-18T09:15:00Z"),
    user_id: "user-123",
    parent_task_id: null,
    created_by: "user-123",
    tags: ["outage", "infrastructure", "critical"],
    // Supporting legacy properties
    assignee: "Alex Wong",
    reporter: "System Alert",
    created: new Date("2023-05-18T08:32:00Z"),
    updated: new Date("2023-05-18T09:15:00Z"),
    comments: [],
    customer: {
      name: "Enterprise Solutions Inc",
      company: "Enterprise Solutions",
      email: "support@enterprisesolutions.com"
    },
    updatedAt: subMinutes(now, 15),
    lastStatusUpdate: "Investigating network connectivity issues between primary and backup data centers.",
    communications: [
      {
        id: "comm-4",
        from: "Enterprise Solutions Support",
        message: "We're experiencing a complete outage. This is affecting all our production services.",
        date: subMinutes(now, 45),
        content: "We're experiencing a complete outage. This is affecting all our production services.",
        sender: "customer"
      },
      {
        id: "comm-5",
        from: "Alex Wong (Support)",
        message: "We've identified the issue with the load balancer. Working on a fix now.",
        date: subMinutes(now, 30),
        content: "We've identified the issue with the load balancer. Working on a fix now.",
        sender: "support"
      }
    ]
  },
  // Keep fixing the other ticket entries with similar patterns
  {
    id: "TICKET-1236",
    title: "Knowledge base article update for new API endpoints",
    description: "Documentation needs to be updated with the latest API changes.",
    status: "Open",
    priority: "Medium",
    assignee_id: "user-456",
    reporter_id: "user-789",
    created_at: new Date("2023-05-16T10:45:00Z"),
    updated_at: new Date("2023-05-17T14:22:00Z"),
    user_id: "user-123",
    parent_task_id: null,
    created_by: "user-123",
    tags: ["documentation", "api", "knowledge-base"],
    // Supporting legacy properties
    assignee: "Maria Garcia",
    reporter: "Developer Relations",
    created: new Date("2023-05-16T10:45:00Z"),
    updated: new Date("2023-05-17T14:22:00Z"),
    comments: [],
    customer: {
      name: "Developer Relations",
      company: "Internal"
    },
    updatedAt: subDays(now, 1),
    summary: "All customer-facing API documentation needs to be updated with the new authentication endpoints and usage examples."
  },
  {
    id: "TICKET-1237",
    title: "Feature request: Add export to CSV functionality",
    description: "Clients requesting ability to export reports in CSV format",
    status: "Under Review",
    priority: "Low",
    assignee_id: null,
    reporter_id: "user-789",
    created_at: new Date("2023-05-14T09:12:00Z"),
    updated_at: new Date("2023-05-15T11:30:00Z"),
    user_id: "user-123",
    parent_task_id: null,
    created_by: "user-123",
    tags: ["feature-request", "reporting", "enhancement"],
    // Supporting legacy properties
    assignee: "Unassigned",
    reporter: "Customer Success",
    created: new Date("2023-05-14T09:12:00Z"),
    updated: new Date("2023-05-15T11:30:00Z"),
    comments: [],
    customer: {
      name: "Jane Smith",
      company: "TechCorp LLC",
      email: "jane@techcorp.com"
    },
    updatedAt: subDays(now, 3)
  },
  {
    id: "TICKET-1238",
    title: "Scheduled maintenance notification for weekend deployment",
    description: "Need to notify all clients about upcoming 2-hour maintenance window",
    status: "Planned",
    priority: "Medium",
    assignee_id: "user-456",
    reporter_id: "user-789",
    created_at: new Date("2023-05-17T15:20:00Z"),
    updated_at: new Date("2023-05-17T16:45:00Z"),
    user_id: "user-123",
    parent_task_id: null,
    created_by: "user-123",
    tags: ["maintenance", "notification", "deployment"],
    // Supporting legacy properties
    assignee: "Communication Team",
    reporter: "DevOps",
    created: new Date("2023-05-17T15:20:00Z"),
    updated: new Date("2023-05-17T16:45:00Z"),
    comments: [],
    customer: {
      name: "All Clients",
      company: "Multiple"
    },
    updatedAt: subDays(now, 1),
    meetingDate: addDays(now, 5)
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I need help with a sync issue on the latest update.',
    sender: 'user',
    timestamp: new Date('2023-11-11T14:35:10'),
    user_id: 'user-123',
    conversation_id: 'conv-123'
  },
  {
    id: '2',
    content: "I understand you're experiencing issues with cloud synchronization after upgrading to version 3.2.1. Could you please tell me what error message you're seeing when you try to sync?",
    sender: 'assistant',
    timestamp: new Date('2023-11-11T14:36:22'),
    user_id: 'user-123',
    conversation_id: 'conv-123'
  },
  {
    id: '3',
    content: "I'm getting \"Error code: AUTH_FAILURE_5523\" whenever I try to connect to the cloud storage.",
    sender: 'user',
    timestamp: new Date('2023-11-11T14:38:45'),
    user_id: 'user-123',
    conversation_id: 'conv-123'
  },
  {
    id: '4',
    content: "Thank you for providing that error code. This specific error (AUTH_FAILURE_5523) typically indicates an authentication token expiration issue after updates. The new version likely requires a fresh authentication flow. Let me guide you through the steps to fix this:\n\n1. Log out of the application completely\n2. Clear the application cache (Settings > Storage > Clear Cache)\n3. Restart the application\n4. Log in with your credentials\n\nThis should trigger a fresh authentication process and resolve the sync issue. Would you like me to explain any of these steps in more detail?",
    sender: 'assistant',
    timestamp: new Date('2023-11-11T14:40:12'),
    user_id: 'user-123',
    conversation_id: 'conv-123'
  }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    content: 'Authentication failure seems to be related to the new token handling system in v3.2.1',
    user_id: 'user-1',
    created_at: new Date('2023-11-11T14:42:30'),
    updated_at: new Date('2023-11-11T14:42:30'),
    timestamp: new Date('2023-11-11T14:42:30'),
    page_id: 'page-1',
    notebook_id: 'nb-1',
    linked_task_id: null,
    // Supporting legacy properties
    sectionId: 'sec-1',
    notebookId: 'nb-1',
    pageId: 'page-1'
  },
  {
    id: '2',
    content: 'Need to check if the token refresh mechanism is working properly. Add this to regression tests.',
    user_id: 'user-1',
    created_at: new Date('2023-11-11T14:45:22'),
    updated_at: new Date('2023-11-11T14:45:22'),
    timestamp: new Date('2023-11-11T14:45:22'),
    page_id: 'page-1',
    notebook_id: 'nb-1',
    linked_task_id: null,
    // Supporting legacy properties
    sectionId: 'sec-1',
    notebookId: 'nb-1',
    pageId: 'page-1'
  },
  {
    id: '3',
    content: 'Similar issue reported in TKT-12340, might be related to the OAuth implementation.',
    user_id: 'user-1',
    created_at: new Date('2023-11-11T14:50:15'),
    updated_at: new Date('2023-11-11T14:50:15'),
    timestamp: new Date('2023-11-11T14:50:15'),
    page_id: 'page-3',
    notebook_id: 'nb-1',
    linked_task_id: null,
    // Supporting legacy properties
    sectionId: 'sec-2',
    notebookId: 'nb-1',
    pageId: 'page-3'
  }
];

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Implement login functionality',
    description: 'Create login form with email and password fields, implement validation and authentication',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date('2023-12-15'),
    assignee: 'John Doe',
    created: new Date('2023-12-01'),
    updated: new Date('2023-12-10'),
    labels: ['Frontend', 'Authentication'],
    project: 'E-commerce Website',
    customer: {
      id: 'cust-1',
      name: 'Acme Inc.',
      company: 'Acme Corporation'
    }
  },
  {
    id: 'task-2',
    title: 'Fix payment gateway integration',
    description: 'Debug issues with Stripe payment processing for international customers',
    status: 'Open',
    priority: 'Critical',
    dueDate: new Date('2023-12-12'),
    assignee: 'Jane Smith',
    created: new Date('2023-12-05'),
    updated: new Date('2023-12-09'),
    labels: ['Backend', 'Payments'],
    project: 'E-commerce Website',
    customer: {
      id: 'cust-1',
      name: 'Acme Inc.',
      company: 'Acme Corporation'
    }
  },
  {
    id: 'task-3',
    title: 'Update product catalog',
    description: 'Add new products and update existing product information',
    status: 'Planned',
    priority: 'Medium',
    dueDate: new Date('2023-12-20'),
    assignee: 'Mark Johnson',
    created: new Date('2023-12-02'),
    updated: new Date('2023-12-08'),
    labels: ['Content', 'Products'],
    project: 'E-commerce Website',
    customer: {
      id: 'cust-1',
      name: 'Acme Inc.',
      company: 'Acme Corporation'
    }
  },
  {
    id: 'task-4',
    title: 'Optimize database queries',
    description: 'Improve performance of slow-running database queries',
    status: 'Open',
    priority: 'High',
    dueDate: new Date('2023-12-18'),
    assignee: 'Sarah Williams',
    created: new Date('2023-12-03'),
    updated: new Date('2023-12-07'),
    labels: ['Backend', 'Performance'],
    project: 'CRM System',
    customer: {
      id: 'cust-2',
      name: 'Global Solutions',
      company: 'Global Solutions Ltd'
    }
  },
  {
    id: 'task-5',
    title: 'Design new landing page',
    description: 'Create mockups for the new marketing landing page',
    status: 'In Review',
    priority: 'Medium',
    dueDate: new Date('2023-12-14'),
    assignee: 'Alex Chen',
    created: new Date('2023-12-04'),
    updated: new Date('2023-12-06'),
    labels: ['Design', 'Marketing'],
    project: 'Website Redesign',
    customer: {
      id: 'cust-3',
      name: 'Tech Innovators',
      company: 'Tech Innovators Inc'
    }
  }
];

export const recentActivities: Partial<Activity>[] = [
  {
    id: "activity-1",
    type: "task_updated",
    user_id: "user-1",
    description: "Updated status from 'Open' to 'In Progress' for task 'Implement login functionality'",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    entity_id: "task-1",
    entity_type: "task",
    userId: "Alex Chen",
    content: "Updated status from 'Open' to 'In Progress' for task 'Implement login functionality'",
    relatedItem: "task-1",
    entityId: "task-1",
    entityType: "task",
    additional_info: {
      previousStatus: "Open",
      newStatus: "In Progress",
      taskId: "task-1"
    }
  },
  {
    id: "activity-2",
    type: "comment_added",
    user_id: "user-2",
    description: "I've identified the issue with the payment gateway. It's related to the API version we're using.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    entity_id: "task-2",
    entity_type: "task",
    userId: "Sarah Williams",
    content: "I've identified the issue with the payment gateway. It's related to the API version we're using.",
    relatedItem: "task-2",
    entityId: "task-2",
    entityType: "task",
    additional_info: {
      taskId: "task-2",
      commentId: "comment-1"
    }
  },
  {
    id: "activity-3",
    type: "note_created",
    user_id: "user-3",
    description: "Created meeting notes for the client onboarding session",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    entity_id: "note-1",
    entity_type: "note",
    userId: "Mark Johnson",
    content: "Created meeting notes for the client onboarding session",
    relatedItem: "note-1",
    entityId: "note-1",
    entityType: "note",
    additional_info: {
      noteId: "note-1",
      pageId: "page-1"
    }
  },
  {
    id: "activity-4",
    type: "task_created",
    user_id: "user-4",
    description: "Created new task 'Design new landing page'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    entity_id: "task-5",
    entity_type: "task",
    userId: "John Doe",
    content: "Created new task 'Design new landing page'",
    relatedItem: "task-5",
    entityId: "task-5",
    entityType: "task",
    additional_info: {
      taskId: "task-5",
      priority: "Medium",
      assignee: "Alex Chen"
    }
  },
  {
    id: "activity-5",
    type: "note_updated",
    user_id: "user-5",
    description: "Updated project requirements document with feedback from client meeting",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    entity_id: "note-2",
    entity_type: "note",
    userId: "Jane Smith",
    content: "Updated project requirements document with feedback from client meeting",
    relatedItem: "note-2",
    entityId: "note-2",
    entityType: "note",
    additional_info: {
      noteId: "note-2",
      pageId: "page-2"
    }
  }
];

export const criticalAlerts = [
  {
    id: "alert-1",
    title: "Production Database Reaching Capacity",
    severity: "high",
    timestamp: subHours(now, 1),
    clientName: "Acme Financial",
    description: "Primary database cluster at 85% capacity, predicted to reach limits within 48 hours"
  },
  {
    id: "alert-2",
    title: "API Rate Limiting Triggered",
    severity: "medium",
    timestamp: subHours(now, 3),
    clientName: "TechCorp LLC",
    description: "Multiple API endpoints experiencing rate limiting due to unusual traffic patterns"
  },
  {
    id: "alert-3",
    title: "Authentication Service Degraded",
    severity: "high",
    timestamp: subMinutes(now, 30),
    clientName: "Multiple Clients",
    description: "Auth service reporting increased latency and intermittent failures"
  }
];

export const upcomingMeetings = [
  {
    id: "meeting-1",
    title: "Project Kickoff",
    date: new Date(Date.now() + 1000 * 60 * 60 * 2),
    duration: 60,
    clientName: "Acme Corp",
    clientId: "client-1",
    attendees: [
      { name: "John Smith", email: "john@acmecorp.com", role: "Product Manager" },
      { name: "Sarah Johnson", email: "sarah@acmecorp.com", role: "Developer" },
      { name: "Michael Davis", email: "michael@youragency.com", role: "Account Manager" }
    ],
    meetingLink: "https://meet.google.com/abc-defg-hij",
    agenda: "- Project introduction\n- Timeline discussion\n- Resource allocation\n- Next steps",
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "meeting-2",
    title: "Weekly Status",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24),
    duration: 30,
    clientName: "TechStart Inc",
    clientId: "client-2",
    attendees: [
      { name: "Emma Wilson", email: "emma@techstart.com", role: "CEO" },
      { name: "James Brown", email: "james@youragency.com", role: "Project Lead" }
    ],
    meetingLink: "https://zoom.us/j/1234567890",
    agenda: "- Progress update\n- Blockers discussion\n- Next week planning",
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "meeting-3",
    title: "Design Review",
    date: new Date(Date.now() + 1000 * 60 * 60 * 48),
    duration: 45,
    clientName: "CreativeMinds",
    clientId: "client-3",
    attendees: [
      { name: "David Lee", email: "david@creativeminds.com", role: "Creative Director" },
      { name: "Alice Cooper", email: "alice@creativeminds.com", role: "Design Lead" },
      { name: "Robert Chen", email: "robert@youragency.com", role: "UI/UX Designer" }
    ],
    meetingLink: "https://teams.microsoft.com/l/meetup-join/abc123",
    agenda: "- Homepage design review\n- Feedback incorporation\n- Mobile responsiveness check",
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const recentTickets = mockTickets.slice(0, 3);
