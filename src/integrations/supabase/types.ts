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
      action_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          additional_info: Json | null
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          timestamp: string | null
          type: string
          user_id: string
        }
        Insert: {
          additional_info?: Json | null
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          timestamp?: string | null
          type: string
          user_id: string
        }
        Update: {
          additional_info?: Json | null
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          timestamp?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_configuration: {
        Row: {
          created_at: string | null
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      assistants: {
        Row: {
          capabilities: string[] | null
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          openai_assistant_id: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          openai_assistant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          openai_assistant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          assistant_id: string
          content: string
          conversation_id: string
          id: string
          is_system: boolean | null
          linked_task_id: string | null
          metadata: Json | null
          sender: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          assistant_id: string
          content: string
          conversation_id: string
          id: string
          is_system?: boolean | null
          linked_task_id?: string | null
          metadata?: Json | null
          sender: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string
          content?: string
          conversation_id?: string
          id?: string
          is_system?: boolean | null
          linked_task_id?: string | null
          metadata?: Json | null
          sender?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assistant_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          project_id: string | null
          task_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          project_id?: string | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          project_id?: string | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "action_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          last_sync: string | null
          name: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          last_sync?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          last_sync?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendees: {
        Row: {
          created_at: string | null
          email: string
          id: string
          meeting_id: string | null
          name: string
          role: string | null
          status: Database["public"]["Enums"]["meeting_attendee_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          meeting_id?: string | null
          name: string
          role?: string | null
          status?: Database["public"]["Enums"]["meeting_attendee_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          meeting_id?: string | null
          name?: string
          role?: string | null
          status?: Database["public"]["Enums"]["meeting_attendee_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_contacts: {
        Row: {
          contact_id: string
          meeting_id: string
        }
        Insert: {
          contact_id: string
          meeting_id: string
        }
        Update: {
          contact_id?: string
          meeting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_contacts_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          bot_id: string | null
          client_id: string | null
          client_name: string
          created_at: string | null
          created_by: string
          date: string
          duration: number
          id: string
          meeting_link: string | null
          notes: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          bot_id?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string | null
          created_by: string
          date: string
          duration: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          bot_id?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string
          date?: string
          duration?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_system: boolean | null
          linked_task_id: string | null
          metadata: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          linked_task_id?: string | null
          metadata?: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          linked_task_id?: string | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_block_tags: {
        Row: {
          block_id: string
          tag: string
        }
        Insert: {
          block_id: string
          tag: string
        }
        Update: {
          block_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_block"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "mind_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_blocks: {
        Row: {
          content: Json
          content_type: string
          created_at: string | null
          id: string
          page_id: string
          position: number | null
          properties: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string | null
          id: string
          page_id: string
          position?: number | null
          properties?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string | null
          id?: string
          page_id?: string
          position?: number | null
          properties?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_page"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "mind_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_page_tags: {
        Row: {
          page_id: string
          tag: string
        }
        Insert: {
          page_id: string
          tag: string
        }
        Update: {
          page_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_page"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "mind_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_pinned: boolean | null
          parent_page_id: string | null
          position: number | null
          section_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_pinned?: boolean | null
          parent_page_id?: string | null
          position?: number | null
          section_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_pinned?: boolean | null
          parent_page_id?: string | null
          position?: number | null
          section_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_page"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "mind_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_section"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "mind_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_sections: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          mindboard_id: string
          position: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          mindboard_id: string
          position?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          mindboard_id?: string
          position?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mindboard"
            columns: ["mindboard_id"]
            isOneToOne: false
            referencedRelation: "mindboards"
            referencedColumns: ["id"]
          },
        ]
      }
      mindboards: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          position: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          position?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          position?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      note_pages: {
        Row: {
          created_at: string | null
          id: string
          is_subpage: boolean | null
          parent_page_id: string | null
          section_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_subpage?: boolean | null
          parent_page_id?: string | null
          section_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_subpage?: boolean | null
          parent_page_id?: string | null
          section_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "note_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "note_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_pages_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "note_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      note_sections: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          notebook_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          notebook_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          notebook_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "note_sections_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          created_at: string | null
          id: string
          sections: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          sections?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          sections?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          linked_task_id: string | null
          notebook_id: string | null
          page_id: string | null
          timestamp: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          linked_task_id?: string | null
          notebook_id?: string | null
          page_id?: string | null
          timestamp?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          linked_task_id?: string | null
          notebook_id?: string | null
          page_id?: string | null
          timestamp?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "note_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          default_assistant_id: string | null
          id: string
          notification_preferences: Json | null
          openai_key: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_assistant_id?: string | null
          id?: string
          notification_preferences?: Json | null
          openai_key?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_assistant_id?: string | null
          id?: string
          notification_preferences?: Json | null
          openai_key?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_completed: boolean | null
          parent_task_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_completed?: boolean | null
          parent_task_id: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_completed?: boolean | null
          parent_task_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_contacts: {
        Row: {
          contact_id: string
          task_id: string
        }
        Insert: {
          contact_id: string
          task_id: string
        }
        Update: {
          contact_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_contacts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          reporter_id: string
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reporter_id: string
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          default_assistant_id: string | null
          notification_preferences: Json | null
          openai_api_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json | null
          openai_api_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_assistant_id?: string | null
          notification_preferences?: Json | null
          openai_api_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string | null
          role: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          billing_tier: string | null
          created_at: string | null
          default_assistant_id: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          billing_tier?: string | null
          created_at?: string | null
          default_assistant_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          billing_tier?: string | null
          created_at?: string | null
          default_assistant_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_activity: {
        Args: {
          p_type: string
          p_content: string
          p_user_id: string
          p_entity_id: string
          p_entity_type: string
          p_additional_info?: Json
        }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      meeting_attendee_status: "pending" | "accepted" | "declined"
      message_role: "user" | "assistant" | "system"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in-progress" | "resolved" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      meeting_attendee_status: ["pending", "accepted", "declined"],
      message_role: ["user", "assistant", "system"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in-progress", "resolved", "closed"],
    },
  },
} as const
