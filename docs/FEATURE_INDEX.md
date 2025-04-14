
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

Last Updated: 2025-04-14

## Feature: Dashboard
Description: Main dashboard showing status overview, alerts, recent tickets, and upcoming meetings.

### Primary Files:
- src/pages/Index.tsx
- src/components/StatusOverview.tsx
- src/components/AlertsPanel.tsx
- src/components/RecentTickets.tsx
- src/components/UpcomingMeetings.tsx
- src/components/ActivityFeed.tsx
- src/components/FloatingActionBar.tsx

Last Updated: 2025-04-14

## Feature: Chat Assistant (ActionBot)
Description: AI-powered chat system with conversation history, streaming responses, and multiple specialized assistants.

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
- src/utils/openAIStream.ts
- src/utils/streamTypes.ts
- src/hooks/useAssistantConfig.ts

### Key Features:
- Real-time streaming of assistant responses
- Immediate user message display
- Multiple specialized AI assistants for different tasks
- Message history persistence
- Rich markdown rendering
- Visual feedback for message status (sending, thinking, etc.)

Last Updated: 2025-04-14

## Feature: Mindboards Knowledge Management System
Description: Notion-inspired block-based editor for notes and documentation with rich interactive features.

### Core Components:
- src/components/mindboard/Mindboard.tsx
- src/components/mindboard/BlockEditor.tsx
- src/components/mindboard/BlockRenderer.tsx
- src/components/mindboard/PageList.tsx
- src/components/mindboard/SectionTabs.tsx
- src/components/mindboard/MindboardSidebar.tsx
- src/components/mindboard/NoteCanvas.tsx
- src/components/mindboard/NotebookSidebar.tsx
- src/hooks/useMindboard.tsx
- src/api/mindboard.ts

### Block Types:
- Text blocks with rich formatting
- To-do lists with checkboxes
- Headings (H1, H2, H3)
- Bullet and numbered lists
- Code blocks with syntax highlighting
- Media blocks (images, files)

### Editing Features:
- Block-based editing
- Slash commands for block creation
- Markdown shortcuts
- Keyboard navigation
- Drag and drop reordering

### Recent Enhancements:
- Shift+Enter support for lists
- Improved block creation
- Enhanced keyboard navigation
- Rich text paste support
- Focus management improvements

Last Updated: 2025-04-14

## Feature: Mission Management (Tasks)
Description: Full task and subtask management system with kanban board views and Supabase database integration.

### Primary Files:
- src/components/mission/MissionsPage.tsx
- src/components/mission/MissionTableView.tsx
- src/components/mission/MissionTaskEditor.tsx
- src/components/mission/MissionCreateButton.tsx
- src/components/mission/TaskList.tsx
- src/components/mission/TaskStatusDropdown.tsx
- src/components/mission/TaskPriorityDropdown.tsx
- src/components/mission/TaskDueDatePicker.tsx
- src/components/mission/RichTextEditor.tsx
- src/hooks/useMissionTasks.tsx
- src/api/tasks.ts
- src/components/modals/TaskCreateDialog.tsx
- src/components/modals/TaskEditDialog.tsx
- src/components/modals/SubtaskCreateDialog.tsx
- src/components/modals/SubtaskEditDialog.tsx

### Key Features:
- Task creation and editing
- Subtask management
- Status tracking
- Priority assignment
- Due date management
- Task filtering and sorting
- Kanban board view

Last Updated: 2025-04-14

## Feature: Project Management
Description: Project organization with task grouping and timeline visualization.

### Primary Files:
- src/components/projects/ProjectsPage.tsx
- src/components/projects/ProjectsPageWrapper.tsx
- src/components/projects/ProjectsTable.tsx
- src/components/projects/ProjectCreateButton.tsx
- src/components/projects/ProjectDetail.tsx
- src/components/projects/ProjectTasksSection.tsx
- src/components/projects/TaskBoard.tsx
- src/components/projects/TaskDetail.tsx
- src/components/projects/TaskTable.tsx
- src/components/projects/TaskTimeline.tsx
- src/hooks/useProjects.ts
- src/api/projects.ts

### Key Features:
- Project creation and management
- Task grouping by project
- Multiple task views (board, table, timeline)
- Project status tracking
- Project filtering and sorting

Last Updated: 2025-04-14

## Feature: Meeting Management
Description: Meeting scheduling with date, time, and attendee management stored in Supabase.

### Primary Files:
- src/api/meetings.ts
- src/hooks/useMeetings.tsx
- src/components/modals/MeetingCreateModal.tsx
- src/components/UpcomingMeetings.tsx
- src/components/MeetingQuickActions.tsx
- src/components/TodaySyncUps.tsx

Last Updated: 2025-04-14

## Feature: Contact Management
Description: Management of contacts/customers with database integration.

### Primary Files:
- src/api/contacts.ts
- src/components/modals/ContactCreateModal.tsx
- src/hooks/useContacts.tsx

Last Updated: 2025-04-14

## Feature: Ticket Management
Description: IT ticket tracking and management with priority and status.

### Primary Files:
- src/api/tickets.ts
- src/components/TicketInfo.tsx
- src/components/TicketQuickActions.tsx
- src/components/RecentTickets.tsx

Last Updated: 2025-04-14

## Feature: User Management
Description: User profiles and team management for task assignment.

### Primary Files:
- src/api/users.ts
- src/hooks/useUsers.tsx
- src/hooks/useProfile.tsx
- src/components/SettingsPage.tsx
- src/components/UserMenu.tsx

Last Updated: 2025-04-14

## Feature: Comments System
Description: Comment threads on tasks, tickets, and projects.

### Primary Files:
- src/api/comments.ts
- src/components/comments/CommentList.tsx
- src/components/comments/CommentSection.tsx

Last Updated: 2025-04-14

## Feature: Navigation
Description: Application-wide navigation with responsive tabs and home button.

### Primary Files:
- src/components/Header.tsx
- src/components/HomeButton.tsx
- src/components/ui/tabs.tsx

Last Updated: 2025-04-14

## Feature: Supabase Integration
Description: Database integration using Supabase for all application data.

### Primary Files:
- src/lib/supabase.ts
- src/integrations/supabase/client.ts
- src/integrations/supabase/types.ts
- src/types/supabase.ts
- supabase/schema.sql
- supabase/config.toml
- supabase/notebooks-rls-fix.sql

Last Updated: 2025-04-14

## Feature: Notion Integration
Description: Integration with Notion for syncing tasks and notes.

### Primary Files:
- src/components/NotionSync.tsx
- src/components/NotionTaskSearch.tsx
- src/integrations/notion/api.ts
- src/integrations/index.ts
- src/hooks/useIntegrations.tsx

Last Updated: 2025-04-14

## Feature: Settings System
Description: Comprehensive settings interface for workspace, user, contact management, and developer options.

### Primary Files:
- src/components/SettingsPage.tsx
- src/types/index.d.ts

Last Updated: 2025-04-14

## Feature: UI Components
Description: Custom UI components built on Shadcn/UI with Tailwind CSS.

### Primary Files:
- src/components/ui/* (numerous component files)
- tailwind.config.ts

### Key Components:
- Accordion
- Alert & Alert Dialog
- Avatar
- Badge
- Button
- Calendar & Date Picker
- Card
- Checkbox & Radio
- Command (Search)
- Dialog & Sheet
- Dropdown Menu
- Form Controls
- Navigation Menu
- Progress
- Select
- Tabs
- Toast
- Tooltip

Last Updated: 2025-04-14

## Architecture Notes

### Database Schema
The application uses a Supabase PostgreSQL database with tables for:
- conversations & chat_messages
- tasks & subtasks
- projects
- contacts
- meetings & meeting_attendees
- tickets
- comments
- notes & mindboards
- activities (audit log)
- assistants (OpenAI assistant configurations)
- user_settings
- app_configuration

### State Management
- React Query for server state management
- React Context for auth and application state
- Custom hooks for feature-specific functionality

### API Integration
- OpenAI API for AI assistant functionality
- Supabase realtime for collaborative features
- Support for third-party integrations via adapter pattern

Last Updated: 2025-04-14

## Recent Updates
- Enhanced message streaming capabilities for ActionBot
- Improved user message display for immediate feedback
- Optimized OpenAI API integration with better error handling
- Added visual feedback for message status
- Implemented scrolling behavior improvements
- Enhanced debugging with better console logging

## Planned Features
- [ ] Real-time collaboration on mindboards
- [ ] Block templates for mindboard
- [ ] Advanced formatting options
- [ ] Block version history
- [ ] Custom block types
- [ ] Block comments
- [ ] Block linking
- [ ] Block search and filtering
- [ ] Enhanced AI assistance for task management
- [ ] Mobile responsive improvements
