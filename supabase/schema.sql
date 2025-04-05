
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types with IF NOT EXISTS check
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE public.task_status AS ENUM ('open', 'in-progress', 'resolved', 'closed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_attendee_status') THEN
        CREATE TYPE public.meeting_attendee_status AS ENUM ('pending', 'accepted', 'declined');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
        CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');
    END IF;
END$$;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'open',
  priority task_priority DEFAULT 'medium',
  assignee_id UUID REFERENCES public.profiles(id),
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES public.companies(id),
  position TEXT,
  avatar TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_contact TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task_contacts junction table
CREATE TABLE IF NOT EXISTS public.task_contacts (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, contact_id)
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  client_name TEXT NOT NULL,
  client_id UUID REFERENCES public.contacts(id),
  meeting_link TEXT,
  agenda TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create meeting_attendees table
CREATE TABLE IF NOT EXISTS public.meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  status meeting_attendee_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT,
  task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role message_role NOT NULL,
  linked_task_id UUID REFERENCES public.tasks(id),
  is_system BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assistants configuration table
CREATE TABLE IF NOT EXISTS public.assistants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[],
  openai_assistant_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notebooks table
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create note_sections table
CREATE TABLE IF NOT EXISTS public.note_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create note_pages table
CREATE TABLE IF NOT EXISTS public.note_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  section_id UUID REFERENCES public.note_sections(id) ON DELETE CASCADE NOT NULL,
  is_subpage BOOLEAN DEFAULT FALSE,
  parent_page_id UUID REFERENCES public.note_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  page_id UUID REFERENCES public.note_pages(id) ON DELETE CASCADE,
  linked_task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activities/audit log table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create app settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  openai_key TEXT,
  default_assistant_id TEXT,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_reporter_id ON public.tasks(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_subtasks_parent_task_id ON public.subtasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_task_contacts_task_id ON public.task_contacts(task_id);
CREATE INDEX IF NOT EXISTS idx_task_contacts_contact_id ON public.task_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON public.meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_task_id ON public.conversations(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_note_sections_notebook_id ON public.note_sections(notebook_id);
CREATE INDEX IF NOT EXISTS idx_note_pages_section_id ON public.note_pages(section_id);
CREATE INDEX IF NOT EXISTS idx_note_pages_parent_page_id ON public.note_pages(parent_page_id);
CREATE INDEX IF NOT EXISTS idx_notes_page_id ON public.notes(page_id);
CREATE INDEX IF NOT EXISTS idx_notes_linked_task_id ON public.notes(linked_task_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON public.activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(type);

-- Trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_tasks
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_subtasks
BEFORE UPDATE ON public.subtasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_contacts
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_meetings
BEFORE UPDATE ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_meeting_attendees
BEFORE UPDATE ON public.meeting_attendees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_conversations
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_assistants
BEFORE UPDATE ON public.assistants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_notebooks
BEFORE UPDATE ON public.notebooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_note_sections
BEFORE UPDATE ON public.note_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_note_pages
BEFORE UPDATE ON public.note_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_notes
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_settings
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_integrations
BEFORE UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can see tasks they created or are assigned to"
  ON public.tasks FOR SELECT
  USING (auth.uid() = reporter_id OR auth.uid() = assignee_id);

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = reporter_id OR auth.uid() = assignee_id);

CREATE POLICY "Users can delete tasks they created"
  ON public.tasks FOR DELETE
  USING (auth.uid() = reporter_id);

-- Subtasks policies
CREATE POLICY "Users can see subtasks of tasks they have access to"
  ON public.subtasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create subtasks for tasks they have access to"
  ON public.subtasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update subtasks of tasks they have access to"
  ON public.subtasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete subtasks of tasks they have access to"
  ON public.subtasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

-- Companies policies
CREATE POLICY "Users can view all companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update companies"
  ON public.companies FOR UPDATE
  USING (true);

-- Contacts policies
CREATE POLICY "Users can view all contacts"
  ON public.contacts FOR SELECT
  USING (true);

CREATE POLICY "Users can create contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON public.contacts FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete contacts"
  ON public.contacts FOR DELETE
  USING (true);

-- Task_contacts policies
CREATE POLICY "Users can view task_contacts they have access to"
  ON public.task_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_contacts.task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage task_contacts they have access to"
  ON public.task_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_contacts.task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete task_contacts they have access to"
  ON public.task_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_contacts.task_id 
      AND (tasks.reporter_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

-- Meetings policies
CREATE POLICY "Users can see meetings they created"
  ON public.meetings FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update meetings they created"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete meetings they created"
  ON public.meetings FOR DELETE
  USING (auth.uid() = created_by);

-- Meeting_attendees policies
CREATE POLICY "Users can see attendees of meetings they created"
  ON public.meeting_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE meetings.id = meeting_attendees.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add attendees to meetings they created"
  ON public.meeting_attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE meetings.id = meeting_attendees.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update attendees of meetings they created"
  ON public.meeting_attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE meetings.id = meeting_attendees.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can remove attendees from meetings they created"
  ON public.meeting_attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE meetings.id = meeting_attendees.meeting_id 
      AND meetings.created_by = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can see their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can see messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Assistants policies
CREATE POLICY "All users can view active assistants"
  ON public.assistants FOR SELECT
  USING (is_active = true);

-- Admin users can manage assistants (simplified for demo, would need proper admin role check)
CREATE POLICY "Admin users can manage assistants"
  ON public.assistants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Notebooks policies
CREATE POLICY "Users can see their own notebooks"
  ON public.notebooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notebooks"
  ON public.notebooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks"
  ON public.notebooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks"
  ON public.notebooks FOR DELETE
  USING (auth.uid() = user_id);

-- Note sections policies
CREATE POLICY "Users can see sections of their notebooks"
  ON public.note_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = note_sections.notebook_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sections in their notebooks"
  ON public.note_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = note_sections.notebook_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in their notebooks"
  ON public.note_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = note_sections.notebook_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections in their notebooks"
  ON public.note_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = note_sections.notebook_id 
      AND notebooks.user_id = auth.uid()
    )
  );

-- Note pages policies
CREATE POLICY "Users can see pages in their notebook sections"
  ON public.note_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.note_sections 
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_sections.id = note_pages.section_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pages in their notebook sections"
  ON public.note_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.note_sections 
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_sections.id = note_pages.section_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in their notebook sections"
  ON public.note_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.note_sections 
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_sections.id = note_pages.section_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages in their notebook sections"
  ON public.note_pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.note_sections 
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_sections.id = note_pages.section_id 
      AND notebooks.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can see notes on their pages"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.note_pages 
      JOIN public.note_sections ON note_pages.section_id = note_sections.id
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_pages.id = notes.page_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes on their pages"
  ON public.notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.note_pages 
      JOIN public.note_sections ON note_pages.section_id = note_sections.id
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_pages.id = notes.page_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes on their pages"
  ON public.notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.note_pages 
      JOIN public.note_sections ON note_pages.section_id = note_sections.id
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_pages.id = notes.page_id 
      AND notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes on their pages"
  ON public.notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.note_pages 
      JOIN public.note_sections ON note_pages.section_id = note_sections.id
      JOIN public.notebooks ON note_sections.notebook_id = notebooks.id
      WHERE note_pages.id = notes.page_id 
      AND notebooks.user_id = auth.uid()
    )
  );

-- Activities policies
CREATE POLICY "Users can see activities related to them"
  ON public.activities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (true);

-- Settings policies
CREATE POLICY "Users can see their own settings"
  ON public.settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Integrations policies
CREATE POLICY "Users can see their own integrations"
  ON public.integrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own integrations"
  ON public.integrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own integrations"
  ON public.integrations FOR DELETE
  USING (user_id = auth.uid());

-- Create a function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_type TEXT,
  p_content TEXT,
  p_user_id UUID,
  p_entity_id UUID,
  p_entity_type TEXT,
  p_additional_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activities (
    type, 
    content, 
    user_id, 
    entity_id, 
    entity_type,
    additional_info
  ) VALUES (
    p_type, 
    p_content, 
    p_user_id, 
    p_entity_id, 
    p_entity_type,
    p_additional_info
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SCHEMA UPDATES - 2024-04-01
-- These alterations fix issues with foreign keys and missing columns

-- Fix 1: Missing Attendees column in meetings table
-- Creating a proper meeting_attendees junction table is already handled
-- No change needed as the schema already has a meeting_attendees table

-- Fix 2: Tasks assignee_id FK constraint
-- Update the assignee_id column to properly reference profiles
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey,
ADD CONSTRAINT tasks_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix 3: Notebooks sections relationship
-- This is already correctly designed with a separate note_sections table
-- No schema change needed

-- Fix 4: Conversations user_id FK constraint
-- Ensure user_id properly references auth.users
ALTER TABLE public.conversations
DROP CONSTRAINT IF EXISTS conversations_user_id_fkey,
ADD CONSTRAINT conversations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix 5: Settings page support
-- Create a workspace settings table
CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  default_assistant_id TEXT,
  billing_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a workspace members junction table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID REFERENCES public.workspace_settings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace settings
CREATE POLICY "Users can view workspace settings they are members of"
  ON public.workspace_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members 
      WHERE workspace_members.workspace_id = workspace_settings.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update workspace settings"
  ON public.workspace_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members 
      WHERE workspace_members.workspace_id = workspace_settings.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'admin'
    )
  );

-- RLS Policies for workspace members
CREATE POLICY "Users can view members of their workspace"
  ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'admin'
    )
  );

-- Add triggers for the new tables
CREATE TRIGGER set_updated_at_workspace_settings
BEFORE UPDATE ON public.workspace_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_workspace_members
BEFORE UPDATE ON public.workspace_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create a default workspace and make the first user an admin
-- This function will run when a new user is created if no workspace exists
CREATE OR REPLACE FUNCTION public.handle_first_workspace()
RETURNS TRIGGER AS $$
DECLARE
  workspace_count INTEGER;
  workspace_id UUID;
BEGIN
  SELECT COUNT(*) INTO workspace_count FROM public.workspace_settings;
  
  IF workspace_count = 0 THEN
    -- Create the first workspace
    INSERT INTO public.workspace_settings (name)
    VALUES ('My Workspace')
    RETURNING id INTO workspace_id;
    
    -- Add the user as admin
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (workspace_id, new.id, 'admin');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_first_user_workspace ON auth.users;
CREATE TRIGGER on_first_user_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_workspace();
