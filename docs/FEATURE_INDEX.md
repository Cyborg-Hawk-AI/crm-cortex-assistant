# Action.it Feature Index

This file serves as a comprehensive index of features implemented in the Action.it application. Each feature entry includes a brief description and the primary files associated with it.

## Feature: Authentication System
Description: User authentication using Supabase, including signup, login, and password reset.

### Primary Files:
- src/contexts/AuthContext.tsx
- src/components/auth/SignupForm.tsx
- src/components/auth/LoginForm.tsx
- src/components/auth/ForgotPasswordForm.tsx
- src/components/auth/UpdatePasswordForm.tsx
- src/components/ProtectedRoute.tsx
- src/lib/supabase.ts

Last Updated: 2023-06-15

## Feature: Dashboard
Description: Main dashboard showing status overview, alerts, recent tasks, and upcoming meetings.

### Primary Files:
- src/pages/Index.tsx
- src/components/StatusOverview.tsx
- src/components/AlertsPanel.tsx
- src/components/RecentTickets.tsx
- src/components/UpcomingMeetings.tsx
- src/components/ActivityFeed.tsx
- src/components/FloatingActionBar.tsx

Last Updated: 2025-04-15

## Feature: Chat Assistant
Description: AI-powered chat system with conversation history and multiple specialized assistants.

### Primary Files:
- src/components/ChatLayout.tsx
- src/components/ChatSection.tsx
- src/components/ConversationSidebar.tsx
- src/components/Message.tsx
- src/hooks/useChatMessages.tsx
- src/api/messages.ts
- src/services/assistantService.ts
- src/services/chatHistoryService.ts
- src/services/openaiClient.ts
- src/utils/assistantConfig.ts

Last Updated: 2023-06-15

## Feature: Notebooks (formerly Mindboard)
Description: Notebook-based note-taking interface with all data persisted to Supabase.

### Primary Files:
- src/components/mindboard/Mindboard.tsx
- src/components/mindboard/BlockEditor.tsx
- src/components/mindboard/BlockRenderer.tsx
- src/components/mindboard/CommandMenu.tsx
- src/components/mindboard/MindboardLayout.tsx
- src/components/mindboard/MindboardSidebar.tsx
- src/components/mindboard/NoteCanvas.tsx
- src/components/mindboard/NotebookSidebar.tsx
- src/components/mindboard/PageList.tsx
- src/components/mindboard/SectionTabs.tsx

Last Updated: 2025-04-15

## Feature: Project Management (formerly Missions)
Description: Full project and task management system with Supabase database integration.

### Primary Files:
- src/components/projects/ProjectsPage.tsx
- src/components/projects/ProjectDetail.tsx
- src/components/projects/ProjectTasksSection.tsx
- src/components/projects/ProjectsTable.tsx
- src/components/TaskList.tsx
- src/api/projects.ts
- src/hooks/useProjects.ts

Last Updated: 2025-04-15

## Feature: Meeting Management
Description: Meeting scheduling with date, time, and attendee management stored in Supabase.

### Primary Files:
- src/api/meetings.ts
- src/hooks/useMeetings.tsx
- src/components/modals/MeetingCreateModal.tsx
- src/components/UpcomingMeetings.tsx
- src/components/MeetingQuickActions.tsx
- src/components/FloatingActionBar.tsx

Last Updated: 2023-06-15

## Feature: Contact Management
Description: Management of contacts/customers with database integration.

### Primary Files:
- src/api/contacts.ts
- src/components/modals/ContactCreateModal.tsx
- src/hooks/useContacts.tsx (implied)

Last Updated: 2023-06-15

## Feature: User Management
Description: User profiles and team management for task assignment.

### Primary Files:
- src/api/users.ts
- src/hooks/useUsers.tsx
- src/hooks/useProfile.tsx
- src/components/SettingsPage.tsx

Last Updated: 2023-06-15

## Feature: Navigation
Description: Application-wide navigation with responsive tabs and home button.

### Primary Files:
- src/components/Header.tsx
- src/components/HomeButton.tsx
- src/components/ui/tabs.tsx

Last Updated: 2025-04-15

## Feature: Supabase Integration
Description: Database integration using Supabase for all application data.

### Primary Files:
- src/lib/supabase.ts
- src/types/supabase.ts
- schema.sql

Last Updated: 2023-06-15

## Feature: Notion Integration
Description: Integration with Notion for syncing tasks and notes.

### Primary Files:
- src/components/NotionSync.tsx
- src/components/NotionTaskSearch.tsx
- src/integrations/notion/api.ts
- src/integrations/index.ts
- src/hooks/useIntegrations.tsx

Last Updated: 2023-06-15

## Feature: Settings System
Description: Comprehensive settings interface for workspace, user, contact management, and developer options.

### Primary Files:
- src/components/SettingsPage.tsx
- schema.sql (user_settings table)

Last Updated: 2023-06-15

## Feature: UI Components
Description: Custom UI components built on Shadcn/UI with Tailwind CSS.

### Primary Files:
- src/components/ui/* (numerous component files)
- tailwind.config.ts

Last Updated: 2023-06-15

## Recent Updates
- Renamed Mindboard to Notebooks throughout the application
- Renamed Missions to Projects throughout the application
- Updated Command View labels for better clarity
- Enhanced mobile responsiveness for sidebar components
- Updated navigation and routing to reflect new naming conventions

## Planned Features
- [ ] Real-time collaboration
- [ ] Block templates
- [ ] Advanced formatting options
- [ ] Block version history
- [ ] Custom block types
- [ ] Block comments
- [ ] Block linking
- [ ] Block search and filtering
