// Import the updated types
import { Ticket, Task, Contact, Meeting, Activity, Communication } from './types';

// Helper function to create consistent string dates
const createDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const ticketData: Ticket[] = [
  {
    id: '1',
    title: 'Integration with payment gateway failing',
    description: 'The Stripe integration is throwing errors when processing payments over $1000.',
    status: 'open',
    priority: 'high',
    created_by: 'James Wilson',
    created_at: createDateString(2),
    updated_at: createDateString(0),
    due_date: createDateString(5),
    customer: {
      name: 'Acme Corp',
      company: 'Acme Corporation',
      email: 'support@acme.com'
    },
    tags: ['integration', 'stripe', 'payment'],
    user_id: 'user-1',
    reporter_id: 'user-2',
    assignee_id: 'user-3'
  },
  {
    id: '2',
    title: 'Customer login issues',
    description: 'Several customers are reporting that they cannot log in to their accounts.',
    status: 'in-progress',
    priority: 'medium',
    created_by: 'Sarah Johnson',
    created_at: createDateString(7),
    updated_at: createDateString(3),
    due_date: createDateString(10),
    customer: {
      name: 'Beta Co',
      company: 'Beta Company',
      email: 'info@betaco.com'
    },
    tags: ['login', 'authentication', 'customer'],
    user_id: 'user-4',
    reporter_id: 'user-5',
    assignee_id: 'user-1'
  },
  {
    id: '3',
    title: 'Mobile app crashing on startup',
    description: 'The latest version of the mobile app is crashing for some users immediately after launch.',
    status: 'resolved',
    priority: 'urgent',
    created_by: 'Emily Davis',
    created_at: createDateString(10),
    updated_at: createDateString(8),
    due_date: createDateString(12),
    customer: {
      name: 'Gamma Inc',
      company: 'Gamma Incorporated',
      email: 'contact@gamma.net'
    },
    tags: ['mobile', 'app', 'crash'],
    user_id: 'user-2',
    reporter_id: 'user-3',
    assignee_id: 'user-4'
  }
];

export const taskData: Task[] = [
  {
    id: 'task-1',
    title: 'Design new landing page',
    description: 'Create a visually appealing and user-friendly landing page for the new product.',
    status: 'open',
    priority: 'high',
    due_date: createDateString(15),
    assignee_id: 'user-1',
    reporter_id: 'user-2',
    user_id: 'user-1',
    parent_task_id: null,
    created_at: createDateString(5),
    updated_at: createDateString(1),
    tags: ['design', 'landing page', 'ux']
  },
  {
    id: 'task-2',
    title: 'Implement user authentication',
    description: 'Set up secure user authentication using OAuth 2.0.',
    status: 'in-progress',
    priority: 'medium',
    due_date: createDateString(20),
    assignee_id: 'user-3',
    reporter_id: 'user-4',
    user_id: 'user-3',
    parent_task_id: null,
    created_at: createDateString(10),
    updated_at: createDateString(7),
    tags: ['authentication', 'oauth', 'security']
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all API endpoints and provide example usage.',
    status: 'completed',
    priority: 'low',
    due_date: createDateString(25),
    assignee_id: 'user-5',
    reporter_id: 'user-1',
    user_id: 'user-5',
    parent_task_id: null,
    created_at: createDateString(15),
    updated_at: createDateString(12),
    tags: ['api', 'documentation', 'development']
  }
];

export const contactData: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    position: 'CEO',
    company: 'Acme Corp',
    notes: 'Primary contact for Acme Corp.',
    tags: ['ceo', 'primary'],
    avatar: 'https://example.com/avatar1.jpg',
    last_contact: createDateString(1),
    created_at: createDateString(3),
    updated_at: createDateString(1),
    company_id: 'company-1'
  },
  {
    id: 'contact-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    position: 'Marketing Manager',
    company: 'Beta Co',
    notes: 'Handles marketing communications.',
    tags: ['marketing', 'communications'],
    avatar: 'https://example.com/avatar2.jpg',
    last_contact: createDateString(5),
    created_at: createDateString(7),
    updated_at: createDateString(5),
    company_id: 'company-2'
  },
  {
    id: 'contact-3',
    name: 'David Lee',
    email: 'david.lee@example.com',
    phone: '555-123-4567',
    position: 'Technical Lead',
    company: 'Gamma Inc',
    notes: 'Technical contact for Gamma Inc.',
    tags: ['technical', 'lead'],
    avatar: 'https://example.com/avatar3.jpg',
    last_contact: createDateString(10),
    created_at: createDateString(12),
    updated_at: createDateString(10),
    company_id: 'company-3'
  }
];

export const meetingData: Meeting[] = [
  {
    id: 'meeting-1',
    title: 'Project Kickoff Meeting',
    date: createDateString(3),
    duration: 60,
    client_id: 'client-1',
    client_name: 'Acme Corp',
    created_by: 'user-1',
    agenda: 'Discuss project goals and timeline.',
    notes: 'Meeting went well, all stakeholders aligned.',
    meeting_link: 'https://example.com/meeting1',
    created_at: createDateString(5),
    updated_at: createDateString(3),
    attendees: [
      { id: 'contact-1', name: 'John Doe', email: 'john.doe@example.com', status: 'accepted', role: 'stakeholder' },
      { id: 'contact-2', name: 'Jane Smith', email: 'jane.smith@example.com', status: 'pending', role: 'attendee' }
    ]
  },
  {
    id: 'meeting-2',
    title: 'Marketing Strategy Review',
    date: createDateString(7),
    duration: 90,
    client_id: 'client-2',
    client_name: 'Beta Co',
    created_by: 'user-2',
    agenda: 'Review Q3 marketing strategy and results.',
    notes: 'Discussed new campaign ideas.',
    meeting_link: 'https://example.com/meeting2',
    created_at: createDateString(9),
    updated_at: createDateString(7),
    attendees: [
      { id: 'contact-3', name: 'David Lee', email: 'david.lee@example.com', status: 'accepted', role: 'presenter' },
      { id: 'contact-1', name: 'John Doe', email: 'john.doe@example.com', status: 'declined', role: 'attendee' }
    ]
  },
  {
    id: 'meeting-3',
    title: 'Technical Deep Dive',
    date: createDateString(11),
    duration: 120,
    client_id: 'client-3',
    client_name: 'Gamma Inc',
    created_by: 'user-3',
    agenda: 'Deep dive into technical challenges.',
    notes: 'Identified key issues and solutions.',
    meeting_link: 'https://example.com/meeting3',
    created_at: createDateString(13),
    updated_at: createDateString(11),
    attendees: [
      { id: 'contact-2', name: 'Jane Smith', email: 'jane.smith@example.com', status: 'accepted', role: 'attendee' },
      { id: 'contact-3', name: 'David Lee', email: 'david.lee@example.com', status: 'accepted', role: 'attendee' }
    ]
  }
];

export const communicationData: Communication[] = [
  {
    id: 'comm-1',
    type: 'email',
    title: 'Initial Contact',
    content: 'Sent initial email to introduce our services.',
    contact_id: 'contact-1',
    contact_name: 'John Doe',
    date: createDateString(4),
    created_by: 'user-1',
    created_at: createDateString(4),
    updated_at: createDateString(4),
    from: 'sales@example.com',
    message: 'Hello John, ...',
    sender: 'Sales Team'
  },
  {
    id: 'comm-2',
    type: 'call',
    title: 'Follow-up Call',
    content: 'Called to follow up on the email.',
    contact_id: 'contact-2',
    contact_name: 'Jane Smith',
    date: createDateString(6),
    created_by: 'user-2',
    created_at: createDateString(6),
    updated_at: createDateString(6),
    from: 'sales@example.com',
    message: 'Called Jane to discuss...',
    sender: 'Sales Team'
  },
  {
    id: 'comm-3',
    type: 'meeting',
    title: 'Product Demo',
    content: 'Conducted a product demo for the client.',
    contact_id: 'contact-3',
    contact_name: 'David Lee',
    date: createDateString(8),
    created_by: 'user-3',
    created_at: createDateString(8),
    updated_at: createDateString(8),
    from: 'sales@example.com',
    message: 'Presented the product...',
    sender: 'Sales Team'
  }
];

export const activityData: Partial<Activity>[] = [
  {
    id: '1',
    type: 'comment',
    content: 'Added a comment to task ABC-123',
    userId: 'user-1', // Changed from user_id to userId
    entityId: 'task-123', // Changed from entity_id to entityId
    entityType: 'task', // Changed from entity_type to entityType
    timestamp: createDateString(0),
  },
  {
    id: '2',
    type: 'status_change',
    content: 'Changed status of task DEF-456 to "In Progress"',
    userId: 'user-2', // Changed from user_id to userId
    entityId: 'task-456', // Changed from entity_id to entityId
    entityType: 'task', // Changed from entity_type to entityType
    timestamp: createDateString(1),
  },
  {
    id: '3',
    type: 'attachment',
    content: 'Uploaded "design_draft.pdf" to project XYZ-789',
    userId: 'user-3', // Changed from user_id to userId
    entityId: 'project-789', // Changed from entity_id to entityId
    entityType: 'project', // Changed from entity_type to entityType
    timestamp: createDateString(2),
  },
  {
    id: '4',
    type: 'meeting',
    content: 'Scheduled a meeting with client Alpha Co',
    userId: 'user-4', // Changed from user_id to userId
    entityId: 'meeting-101', // Changed from entity_id to entityId
    entityType: 'meeting', // Changed from entity_type to entityType
    timestamp: createDateString(3),
  },
  {
    id: '5',
    type: 'contact',
    content: 'Created a new contact, John Doe',
    userId: 'user-5', // Changed from user_id to userId
    entityId: 'contact-202', // Changed from entity_id to entityId
    entityType: 'contact', // Changed from entity_type to entityType
    timestamp: createDateString(4),
  },
];
