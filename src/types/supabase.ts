
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'open' | 'in-progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id: string | null
          reporter_id: string
          due_date: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'open' | 'in-progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          reporter_id: string
          due_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'open' | 'in-progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          reporter_id?: string
          due_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          title: string
          parent_task_id: string
          is_completed: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          parent_task_id: string
          is_completed?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          parent_task_id?: string
          is_completed?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          task_id: string | null
          assistant_id: string | null
          open_ai_thread_id: string | null
          created_at: string
          updated_at: string
          is_archived: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          task_id?: string | null
          assistant_id?: string | null
          open_ai_thread_id?: string | null
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          task_id?: string | null
          assistant_id?: string | null
          open_ai_thread_id?: string | null
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          assistant_id: string | null
          user_id: string
          content: string
          sender: 'user' | 'assistant' | 'system'
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          conversation_id: string
          assistant_id?: string | null
          user_id: string
          content: string
          sender: 'user' | 'assistant' | 'system'
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          conversation_id?: string
          assistant_id?: string | null
          user_id?: string
          content?: string
          sender?: 'user' | 'assistant' | 'system'
          timestamp?: string
          metadata?: Json | null
        }
      }
      user_settings: {
        Row: {
          user_id: string
          openai_api_key: string | null
          default_assistant_id: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          openai_api_key?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          openai_api_key?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      assistants: {
        Row: {
          id: string
          name: string
          description: string | null
          capabilities: string[]
          openai_assistant_id: string
          is_active: boolean
          created_at: string
          updated_at: string
          configuration: Json | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          capabilities?: string[]
          openai_assistant_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          configuration?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          capabilities?: string[]
          openai_assistant_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          configuration?: Json | null
        }
      }
      app_configuration: {
        Row: {
          key: string
          value: string
          is_secret: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          is_secret?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          is_secret?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          industry: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company_id: string | null
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company_id?: string | null
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company_id?: string | null
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          date: string
          duration: number | null
          meeting_link: string | null
          agenda: string | null
          notes: string | null
          organizer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          duration?: number | null
          meeting_link?: string | null
          agenda?: string | null
          notes?: string | null
          organizer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          duration?: number | null
          meeting_link?: string | null
          agenda?: string | null
          notes?: string | null
          organizer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      meeting_attendees: {
        Row: {
          id: string
          meeting_id: string
          contact_id: string | null
          user_id: string | null
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          contact_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          contact_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          openai_key: string | null
          default_assistant_id: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          openai_key?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          openai_key?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
