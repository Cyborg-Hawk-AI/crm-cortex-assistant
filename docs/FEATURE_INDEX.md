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
Description: Main dashboard showing status overview, alerts, recent tickets, and upcoming meetings.

### Primary Files:
- src/pages/Index.tsx
- src/components/StatusOverview.tsx
- src/components/AlertsPanel.tsx
- src/components/RecentTickets.tsx
- src/components/UpcomingMeetings.tsx
- src/components/ActivityFeed.tsx
- src/components/FloatingActionBar.tsx

Last Updated: 2023-06-15

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

## Feature: Scratchpad Notes
Description: Notebook-based note-taking interface with all data persisted to Supabase.

### Primary Files:
- src/components/ScratchpadNotes.tsx
- src/components/ScratchpadSection.tsx
- src/hooks/useNotes.tsx
- src/api/notebooks.ts
- src/components/modals/NotebookCreateModal.tsx

Last Updated: 2023-06-15

## Feature: Task Management
Description: Full task and subtask management system with Supabase database integration. Foreign key constraints have been configured to support the data model.

### Primary Files:
- src/components/TasksPage.tsx
- src/components/TaskList.tsx
- src/api/tasks.ts
- src/hooks/useTasks.tsx
- src/components/modals/TaskCreateDialog.tsx
- src/components/modals/TaskEditDialog.tsx
- src/components/modals/SubtaskCreateDialog.tsx
- src/components/modals/SubtaskEditDialog.tsx

Last Updated: 2023-06-15

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

Last Updated: 2023-06-15

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

## Feature: Mindboard
Description: Hierarchical knowledge management system with mindboards, sections, pages, and blocks. Supports nested organization and rich content types.

### Primary Files:
- src/components/mindboard/Mindboard.tsx
- src/components/mindboard/MindboardSidebar.tsx
- src/components/mindboard/SectionTabs.tsx
- src/components/mindboard/PageList.tsx
- src/components/mindboard/BlockEditor.tsx
- src/components/mindboard/BlockRenderer.tsx
- src/hooks/useMindboard.tsx
- src/api/mindboard.ts
- src/utils/types.ts (Mindboard, MindSection, MindPage, MindBlock types)

### Features:
- Mindboard: Top-level workspace (like a notebook)
- MindSection: Logical groupings inside a Mindboard (like tabs)
- MindPage: Documents within a section (can nest as subpages)
- MindBlock: Individual content units inside a MindPage
- Rich content types: text, todo, image, file, code, audio, video, embed
- Collapsible sidebar for mindboard navigation
- Section tabs for easy section switching
- Page list with create/edit/delete functionality
- Block editor with multiple content type support

Last Updated: 2024-03-05

## Architecture Notes

### Database Schema
The application uses a Supabase PostgreSQL database with tables for:
- conversations & chat_messages
- tasks & subtasks
- contacts
- meetings & meeting_attendees
- notes
- activities (audit log)
- assistants (OpenAI assistant configurations)
- user_settings
- app_configuration

### State Management
- React Query for server state management
- React Context for auth and application state
- Custom hooks for feature-specific functionality

Last Updated: 2023-06-15

## Block Editor Enhancements

### Shift+Enter for To-do Lists and Lists
- **Feature**: Pressing Shift+Enter in a to-do, bullet, or numbered list creates a new item below
- **Behavior**:
  - Creates a new block of the same type immediately below the current one
  - Preserves indentation level and parent-child relationships
  - Maintains focus at the beginning of the new block
  - Inherits properties like assignee, due date, priority, and status
- **UI/UX**:
  - Smooth scrolling to the new block
  - No UI jumps or flickers during transition
  - Natural cursor positioning
  - Preserves all relevant block properties

### Block Creation and Focus Management
- **Automatic Block Creation**:
  - Creates a text block when clicking on empty editor
  - Maintains proper focus and selection
  - Preserves scroll position
- **Focus Handling**:
  - Automatic focus on newly created blocks
  - Proper cursor positioning
  - Smooth transitions between blocks

### Keyboard Navigation
- **Arrow Keys**: Navigate between blocks
- **Enter**: Create new block below
- **Shift+Enter**: Create new list item or insert line break
- **Backspace**: Remove empty blocks
- **Tab/Shift+Tab**: Indent/unindent blocks
- **Ctrl+Shift+Arrow**: Reorder blocks

### Block Type Conversion
- **Markdown Shortcuts**:
  - `#` → Heading 1
  - `##` → Heading 2
  - `###` → Heading 3
  - `-` → Bullet List
  - `1.` → Numbered List
  - `[]` → To-do
- **Slash Commands**:
  - `/text` → Text Block
  - `/h1` → Heading 1
  - `/h2` → Heading 2
  - `/h3` → Heading 3
  - `/todo` → To-do
  - `/bullet` → Bullet List
  - `/numbered` → Numbered List
  - And more...

### Rich Text Support
- **Paste Handling**:
  - Preserves formatting when pasting content
  - Converts HTML to Markdown and back
  - Sanitizes content for security
- **Content Types**:
  - Text blocks with rich formatting
  - Headings with proper styling
  - To-do lists with checkboxes
  - Bullet and numbered lists
  - Code blocks with syntax highlighting
  - And more...

### UI/UX Polish
- **Block Controls**:
  - Hover to reveal block actions
  - Drag handle for reordering
  - Delete and duplicate options
- **Insert Block UI**:
  - "+" button appears between blocks
  - Smooth hover transitions
  - Proper positioning
- **Visual Feedback**:
  - Selected block highlighting
  - Focus indicators
  - Smooth animations

### Code Editor Integration
- **Monaco Editor**:
  - Syntax highlighting
  - Line numbers
  - Proper indentation
  - Code-specific keyboard shortcuts
  - Custom styling

## Recent Updates
- Added Shift+Enter support for to-do lists and bulleted lists
- Enhanced block creation with proper focus management
- Improved keyboard navigation and shortcuts
- Added rich text paste support
- Enhanced block selector menu positioning
- Added smooth scrolling and transitions
- Improved type safety and error handling

## Planned Features
- [ ] Real-time collaboration
- [ ] Block templates
- [ ] Advanced formatting options
- [ ] Block version history
- [ ] Custom block types
- [ ] Block comments
- [ ] Block linking
- [ ] Block search and filtering
