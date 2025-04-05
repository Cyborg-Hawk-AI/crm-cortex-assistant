
-- Create schema for the application with existence checks

-- Conversations table to track chat threads
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  task_id UUID,
  assistant_id TEXT NOT NULL,  -- Now NOT NULL
  open_ai_thread_id TEXT,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,
  assistant_id TEXT NOT NULL,  -- Now NOT NULL
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Tasks table (removed foreign key constraints)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  assignee_id TEXT,
  reporter_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  customer_id UUID
);

-- Subtasks table (removed foreign key constraints)
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  parent_task_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_parent_task FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Contacts (customers) table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  client_name TEXT NOT NULL,
  client_id UUID NOT NULL,
  meeting_link TEXT,
  agenda TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting attendees junction table
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  CONSTRAINT fk_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Task-Contact relationship table
CREATE TABLE IF NOT EXISTS task_contacts (
  task_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  PRIMARY KEY (task_id, contact_id),
  CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

-- Meeting-Contact relationship table
CREATE TABLE IF NOT EXISTS meeting_contacts (
  meeting_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  PRIMARY KEY (meeting_id, contact_id),
  CONSTRAINT fk_meeting_rel FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  CONSTRAINT fk_contact_rel FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_id UUID,
  linked_task_id UUID,
  section_id UUID,
  notebook_id UUID
);

-- Activities/Audit log table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  additional_info JSONB
);

-- OpenAI Assistants Configuration
CREATE TABLE IF NOT EXISTS assistants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[],
  openai_assistant_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  configuration JSONB
);

-- User settings table including OpenAI API key
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY,
  openai_api_key TEXT,
  default_assistant_id TEXT,
  notification_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mindboard Hierarchical Structure
-- Mindboards table (equivalent to Notebooks)
CREATE TABLE IF NOT EXISTS mindboards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MindSections table (equivalent to Section tabs)
CREATE TABLE IF NOT EXISTS mind_sections (
  id UUID PRIMARY KEY,
  mindboard_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_mindboard FOREIGN KEY (mindboard_id) REFERENCES mindboards(id) ON DELETE CASCADE
);

-- MindPages table (individual notes in a section)
CREATE TABLE IF NOT EXISTS mind_pages (
  id UUID PRIMARY KEY,
  section_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  parent_page_id UUID, -- For subpages/hierarchical structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_section FOREIGN KEY (section_id) REFERENCES mind_sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_parent_page FOREIGN KEY (parent_page_id) REFERENCES mind_pages(id) ON DELETE CASCADE
);

-- Mindblocks table (content blocks within pages)
CREATE TABLE IF NOT EXISTS mind_blocks (
  id UUID PRIMARY KEY,
  page_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'todo', 'image', 'file', 'code', 'audio', etc.
  content JSONB NOT NULL,
  position INTEGER DEFAULT 0,
  properties JSONB, -- For block-specific properties like color, style, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_page FOREIGN KEY (page_id) REFERENCES mind_pages(id) ON DELETE CASCADE
);

-- Mind block tags for organization
CREATE TABLE IF NOT EXISTS mind_block_tags (
  block_id UUID NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (block_id, tag),
  CONSTRAINT fk_block FOREIGN KEY (block_id) REFERENCES mind_blocks(id) ON DELETE CASCADE
);

-- Mind page tags for organization
CREATE TABLE IF NOT EXISTS mind_page_tags (
  page_id UUID NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (page_id, tag),
  CONSTRAINT fk_page FOREIGN KEY (page_id) REFERENCES mind_pages(id) ON DELETE CASCADE
);

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_user_id') THEN
        CREATE INDEX idx_conversations_user_id ON conversations(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_thread_id') THEN
        -- Make sure the column exists before creating the index
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'open_ai_thread_id'
        ) THEN
            CREATE INDEX idx_conversations_thread_id ON conversations(open_ai_thread_id);
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_conversation_id') THEN
        CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_user_id') THEN
        CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assignee') THEN
        CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status') THEN
        CREATE INDEX idx_tasks_status ON tasks(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_due_date') THEN
        CREATE INDEX idx_tasks_due_date ON tasks(due_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meetings_date') THEN
        CREATE INDEX idx_meetings_date ON meetings(date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meetings_client_id') THEN
        CREATE INDEX idx_meetings_client_id ON meetings(client_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_entity_id') THEN
        CREATE INDEX idx_activities_entity_id ON activities(entity_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_user_id') THEN
        CREATE INDEX idx_activities_user_id ON activities(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_timestamp') THEN
        CREATE INDEX idx_activities_timestamp ON activities(timestamp);
    END IF;
    
    -- Add indexes for our new Mindboard hierarchy
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mindboards_user_id') THEN
        CREATE INDEX idx_mindboards_user_id ON mindboards(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_sections_mindboard_id') THEN
        CREATE INDEX idx_mind_sections_mindboard_id ON mind_sections(mindboard_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_sections_user_id') THEN
        CREATE INDEX idx_mind_sections_user_id ON mind_sections(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_pages_section_id') THEN
        CREATE INDEX idx_mind_pages_section_id ON mind_pages(section_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_pages_user_id') THEN
        CREATE INDEX idx_mind_pages_user_id ON mind_pages(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_pages_parent_id') THEN
        CREATE INDEX idx_mind_pages_parent_id ON mind_pages(parent_page_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_blocks_page_id') THEN
        CREATE INDEX idx_mind_blocks_page_id ON mind_blocks(page_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_blocks_user_id') THEN
        CREATE INDEX idx_mind_blocks_user_id ON mind_blocks(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mind_blocks_content_type') THEN
        CREATE INDEX idx_mind_blocks_content_type ON mind_blocks(content_type);
    END IF;
END $$;

-- RLS Policies with checks to avoid errors if they already exist
DO $$
BEGIN
    -- Enable RLS (idempotent operation, no existence check needed)
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE task_contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE meeting_contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS for Mindboard tables
    ALTER TABLE mindboards ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mind_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mind_pages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mind_blocks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mind_block_tags ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mind_page_tags ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own conversations') THEN
        CREATE POLICY "Users can view own conversations" 
        ON conversations FOR SELECT 
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own conversations') THEN
        CREATE POLICY "Users can insert own conversations" 
        ON conversations FOR INSERT 
        WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own conversations') THEN
        CREATE POLICY "Users can update own conversations" 
        ON conversations FOR UPDATE 
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own conversations') THEN
        CREATE POLICY "Users can delete own conversations" 
        ON conversations FOR DELETE 
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their messages') THEN
        CREATE POLICY "Users can view their messages"
        ON chat_messages FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = chat_messages.conversation_id
            AND conversations.user_id = auth.uid()
        ));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their messages') THEN
        CREATE POLICY "Users can insert their messages"
        ON chat_messages FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own settings') THEN
        CREATE POLICY "Users can view their own settings"
        ON user_settings FOR SELECT
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own settings') THEN
        CREATE POLICY "Users can insert their own settings"
        ON user_settings FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own settings') THEN
        CREATE POLICY "Users can update their own settings"
        ON user_settings FOR UPDATE
        USING (user_id = auth.uid());
    END IF;
    
    -- Create RLS policies for Mindboard tables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mindboards') THEN
        CREATE POLICY "Users can view own mindboards"
        ON mindboards FOR SELECT
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own mindboards') THEN
        CREATE POLICY "Users can insert own mindboards"
        ON mindboards FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own mindboards') THEN
        CREATE POLICY "Users can update own mindboards"
        ON mindboards FOR UPDATE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own mindboards') THEN
        CREATE POLICY "Users can delete own mindboards"
        ON mindboards FOR DELETE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mind sections') THEN
        CREATE POLICY "Users can view own mind sections"
        ON mind_sections FOR SELECT
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own mind sections') THEN
        CREATE POLICY "Users can insert own mind sections"
        ON mind_sections FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own mind sections') THEN
        CREATE POLICY "Users can update own mind sections"
        ON mind_sections FOR UPDATE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own mind sections') THEN
        CREATE POLICY "Users can delete own mind sections"
        ON mind_sections FOR DELETE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mind pages') THEN
        CREATE POLICY "Users can view own mind pages"
        ON mind_pages FOR SELECT
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own mind pages') THEN
        CREATE POLICY "Users can insert own mind pages"
        ON mind_pages FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own mind pages') THEN
        CREATE POLICY "Users can update own mind pages"
        ON mind_pages FOR UPDATE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own mind pages') THEN
        CREATE POLICY "Users can delete own mind pages"
        ON mind_pages FOR DELETE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mind blocks') THEN
        CREATE POLICY "Users can view own mind blocks"
        ON mind_blocks FOR SELECT
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own mind blocks') THEN
        CREATE POLICY "Users can insert own mind blocks"
        ON mind_blocks FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own mind blocks') THEN
        CREATE POLICY "Users can update own mind blocks"
        ON mind_blocks FOR UPDATE
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own mind blocks') THEN
        CREATE POLICY "Users can delete own mind blocks"
        ON mind_blocks FOR DELETE
        USING (user_id = auth.uid());
    END IF;
    
    -- Block tags policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mind block tags') THEN
        CREATE POLICY "Users can view own mind block tags"
        ON mind_block_tags FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM mind_blocks
            WHERE mind_blocks.id = mind_block_tags.block_id
            AND mind_blocks.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own mind block tags') THEN
        CREATE POLICY "Users can manage own mind block tags"
        ON mind_block_tags FOR ALL
        USING (EXISTS (
            SELECT 1 FROM mind_blocks
            WHERE mind_blocks.id = mind_block_tags.block_id
            AND mind_blocks.user_id = auth.uid()
        ));
    END IF;
    
    -- Page tags policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own mind page tags') THEN
        CREATE POLICY "Users can view own mind page tags"
        ON mind_page_tags FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM mind_pages
            WHERE mind_pages.id = mind_page_tags.page_id
            AND mind_pages.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own mind page tags') THEN
        CREATE POLICY "Users can manage own mind page tags"
        ON mind_page_tags FOR ALL
        USING (EXISTS (
            SELECT 1 FROM mind_pages
            WHERE mind_pages.id = mind_page_tags.page_id
            AND mind_pages.user_id = auth.uid()
        ));
    END IF;
END $$;

-- Environment configuration table (for OpenAI API keys and other config)
CREATE TABLE IF NOT EXISTS app_configuration (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert OpenAI API key into app_configuration if it doesn't exist
INSERT INTO app_configuration (key, value, is_secret)
VALUES ('openai_api_key', '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', true)
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
