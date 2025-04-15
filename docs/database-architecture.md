
# ActionIt Database Architecture

## Overview

ActionIt uses Supabase PostgreSQL as its database backend, implementing a comprehensive data model that supports the core functionalities of tasks, notebooks, conversations, meetings, and user management. The database schema is designed with scalability, security, and performance in mind.

## Core Entities

### 1. User Management

#### Profiles
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```
- Extends Supabase auth.users
- Stores user profile information
- Referenced by most other tables for user association

### 2. Projects (formerly Missions)

#### Tasks
```sql
tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status,
  priority task_priority,
  assignee_id UUID,
  reporter_id UUID NOT NULL,
  user_id UUID,
  due_date TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  parent_task_id UUID
)
```

#### Subtasks
```sql
subtasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  parent_task_id UUID NOT NULL,
  user_id UUID,
  is_completed BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 3. Notebooks (formerly Mindboard)

#### Notebooks
```sql
mindboards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### Sections
```sql
mind_sections (
  id UUID PRIMARY KEY,
  mindboard_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### Pages
```sql
mind_pages (
  id UUID PRIMARY KEY,
  section_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER,
  is_pinned BOOLEAN,
  parent_page_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### Blocks
```sql
mind_blocks (
  id UUID PRIMARY KEY,
  page_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content JSONB NOT NULL,
  position INTEGER,
  properties JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 4. AI Conversations

#### Conversations
```sql
conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  task_id UUID,
  assistant_id TEXT,
  open_ai_thread_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_archived BOOLEAN
)
```

#### Chat Messages
```sql
chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,
  assistant_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  timestamp TIMESTAMPTZ,
  metadata JSONB
)
```

### 5. Meetings Management

#### Meetings
```sql
meetings (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  client_name TEXT NOT NULL,
  client_id UUID,
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Relationships and Foreign Keys

### Project Management
- Tasks → Profiles (assignee_id, reporter_id)
- Subtasks → Tasks (parent_task_id)
- Tasks → Tasks (parent_task_id) for hierarchical task structure

### Notebook System
- Sections → Notebooks (mindboard_id)
- Pages → Sections (section_id)
- Pages → Pages (parent_page_id) for hierarchical page structure
- Blocks → Pages (page_id)

### AI Integration
- Conversations → Tasks (task_id) for task context
- Chat Messages → Conversations (conversation_id)
- All entities → Users/Profiles (user_id) for ownership

## Security Model

### Row Level Security (RLS)
All tables implement Row Level Security policies ensuring:
- Users can only access their own data
- Data isolation between different users
- Proper access control for shared resources

Example RLS Policy:
```sql
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);
```

### Authentication
- Built on Supabase Auth
- JWT-based authentication
- Role-based access control
- Secure password hashing
- Email verification support

## Indexing Strategy

### Primary Indexes
- All tables have PRIMARY KEY constraints
- UUIDs used for unique identification

### Performance Indexes
```sql
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_mind_blocks_page_id ON mind_blocks(page_id);
```

## Data Types

### Custom Enums
```sql
CREATE TYPE task_status AS ENUM (
  'open',
  'in-progress',
  'resolved',
  'closed'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);
```

### JSON Storage
- JSONB used for flexible data storage
- Supports complex data structures
- Used in:
  - mind_blocks.content
  - mind_blocks.properties
  - chat_messages.metadata

## Data Integrity

### Constraints
- Foreign key constraints ensure referential integrity
- NOT NULL constraints on required fields
- Default values for timestamp fields
- Unique constraints where appropriate

### Timestamps
- created_at and updated_at columns on all tables
- Automatic updates via triggers
- Timezone awareness (TIMESTAMPTZ)

## Performance Considerations

### Optimization Techniques
1. Proper indexing on frequently queried columns
2. JSONB for flexible schema requirements
3. Materialized views for complex queries
4. Partitioning for large tables (future consideration)

### Query Optimization
- Efficient joins through proper indexing
- Minimal use of subqueries
- Proper use of table statistics

## Backup and Recovery

### Backup Strategy
- Point-in-time recovery enabled
- Daily backups
- Transaction logs for continuous backup

### Recovery Process
- Multiple recovery points available
- Automated backup verification
- Quick restoration capability

## Future Considerations

### Scalability
1. Table partitioning for large datasets
2. Read replicas for heavy read workloads
3. Materialized views for complex reports

### Planned Improvements
1. Additional indexes based on query patterns
2. Archival strategy for old data
3. Enhanced audit logging

## Maintenance

### Regular Tasks
1. Index maintenance
2. Statistics updates
3. Performance monitoring
4. Space usage monitoring

### Best Practices
1. Regular backup testing
2. Performance audits
3. Security reviews
4. Schema optimization

