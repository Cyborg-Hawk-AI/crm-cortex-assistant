
# Action.it - Code Organization & System Architecture

## Table of Contents

- [Overview](#overview)
  - [Purpose & Vision](#purpose--vision)
  - [High-Level Architecture](#high-level-architecture)
  - [Key Technologies](#key-technologies)
- [Frontend Architecture](#frontend-architecture)
  - [Code Organization](#code-organization)
  - [Major Modules](#major-modules)
- [Component Deep Dive](#component-deep-dive)
  - [Notebooks Module](#notebooks-module)
  - [Projects Module](#projects-module)
  - [Chat Assistant Module](#chat-assistant-module)
  - [Dashboard](#dashboard)
  - [Settings](#settings)
- [State Management](#state-management)
  - [React Query Implementation](#react-query-implementation)
  - [Local State Management](#local-state-management)
  - [Custom Hooks](#custom-hooks)
- [Data Flow Architecture](#data-flow-architecture)
  - [Client-Server Communication](#client-server-communication)
  - [Optimistic Updates](#optimistic-updates)
  - [Real-time Features](#real-time-features)
- [Backend Integration](#backend-integration)
  - [Supabase Architecture](#supabase-architecture)
  - [Authentication Flow](#authentication-flow)
  - [Database Access Patterns](#database-access-patterns)
  - [Edge Functions](#edge-functions)
- [UI/UX Implementation](#uiux-implementation)
  - [Component Design System](#component-design-system)
  - [Theming & Styling](#theming--styling)
  - [Animations & Transitions](#animations--transitions)
  - [Responsive Design](#responsive-design)
- [Advanced Features](#advanced-features)
  - [Block Editor Engine](#block-editor-engine)
  - [AI Assistant Integration](#ai-assistant-integration)
  - [Command System](#command-system)
- [Error Handling & Logging](#error-handling--logging)
  - [Error Boundaries](#error-boundaries)
  - [Toast Notifications](#toast-notifications)
  - [Logging Strategy](#logging-strategy)
- [Development Guidelines](#development-guidelines)
  - [Component Creation](#component-creation)
  - [Coding Standards](#coding-standards)
  - [Debugging Practices](#debugging-practices)
  - [Performance Optimization](#performance-optimization)
- [Appendix](#appendix)
  - [Glossary](#glossary)
  - [File Structure Map](#file-structure-map)
  - [Common Patterns](#common-patterns)

## Overview

### Purpose & Vision

Action.it is a comprehensive productivity platform designed specifically for engineers. It combines multiple productivity tools into a single, cohesive interface:

- **Notebooks** (previously Mindboard): A flexible knowledge management system with a block-based editor
- **Projects** (previously Missions): Task and project management with hierarchical organization
- **ActionBot**: AI-powered assistant for contextual help
- **Command View**: A centralized dashboard for activity monitoring and quick actions

The system is designed with a futuristic aesthetic featuring deep teals, steel blues, and vibrant purple/orange accents, prioritizing mobile responsiveness and a clean, high-contrast interface.

### High-Level Architecture

Action.it follows a modern client-side architecture with a robust backend integration:

```
┌─────────────────────────────────┐           ┌─────────────────────────┐
│  Client Application (React)     │           │  Supabase Backend       │
│                                 │           │                         │
│  ┌─────────────┐ ┌─────────────┐│           │ ┌─────────────────────┐ │
│  │  Notebooks  │ │  Projects   ││           │ │  PostgreSQL         │ │
│  └─────────────┘ └─────────────┘│◄─────────►│ │  Database           │ │
│                                 │           │ └─────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐│           │                         │
│  │ Chat        │ │ Dashboard   ││           │ ┌─────────────────────┐ │
│  │ Assistant   │ │             ││           │ │  Authentication     │ │
│  └─────────────┘ └─────────────┘│◄─────────►│ │  Service            │ │
│                                 │           │ └─────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐│           │                         │
│  │ Settings    │ │ Meetings    ││           │ ┌─────────────────────┐ │
│  │             │ │             ││           │ │  Storage            │ │
│  └─────────────┘ └─────────────┘│◄─────────►│ │  Service            │ │
│                                 │           │ └─────────────────────┘ │
│  ┌─────────────────────────────┐│           │                         │
│  │     Shared UI Components    ││           │ ┌─────────────────────┐ │
│  └─────────────────────────────┘│           │ │  Edge Functions     │ │
└─────────────────────────────────┘           │ └─────────────────────┘ │
                                              └─────────────────────────┘
```

### Key Technologies

- **Frontend**: 
  - React 18 with TypeScript for type safety
  - Tailwind CSS for styling with a custom design system
  - Shadcn/UI as the component library foundation
  - Framer Motion for animations
  - React Query for state management and data fetching

- **Backend**: 
  - Supabase for database, authentication, storage
  - PostgreSQL for data persistence
  - Row Level Security (RLS) for data protection
  - Edge Functions for serverless operations

- **Development Tools**:
  - Vite for fast builds
  - ESLint and Prettier for code quality
  - TypeScript for static typing

## Frontend Architecture

### Code Organization

The codebase follows a feature-based organization with the following structure:

```
src/
├── api/              # API integration layer
│   ├── mindboard.ts  # Notebooks API operations
│   ├── projects.ts   # Projects API operations
│   ├── messages.ts   # Chat messages API operations
│   └── ...
├── components/       # React components
│   ├── mindboard/    # Notebooks components
│   ├── projects/     # Projects components
│   ├── ui/           # Shared UI components
│   └── ...
├── contexts/         # React contexts
│   ├── AuthContext.tsx
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useMindboard.tsx
│   ├── useChatMessages.tsx
│   └── ...
├── lib/              # Utility libraries
│   ├── supabase.ts   # Supabase client
│   ├── utils.ts      # General utilities
│   └── ...
├── pages/            # Page components
├── services/         # Service integrations
│   ├── assistantService.ts
│   └── ...
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

### Major Modules

1. **Notebooks (formerly Mindboard)**
   - Block-based note-taking and knowledge management
   - Hierarchical organization: Notebooks > Sections > Pages > Blocks

2. **Projects (formerly Missions)**
   - Task and project tracking
   - Hierarchical task organization with subtasks
   - Status and priority tracking

3. **Chat Assistant (ActionBot)**
   - AI-powered contextual assistance
   - Conversation history and specialized assistants
   - Task context integration

4. **Dashboard (Command View)**
   - Activity overview
   - Quick access to recent items
   - Status summaries

5. **Meeting Management**
   - Meeting scheduling and organization
   - Attendee management
   - Meeting notes

## Component Deep Dive

### Notebooks Module

The Notebooks module provides a Notion-like document editing experience with a block-based editor.

#### Key Components

- **Mindboard.tsx**
  - Entry point for the notebooks feature
  - Manages state for active notebook, section, and page
  - Delegates UI rendering to MindboardLayout

- **MindboardLayout.tsx**
  - Handles the overall layout of the notebooks interface
  - Manages sidebar visibility and content area
  - Orchestrates interactions between navigation and content

- **MindboardSidebar.tsx**
  - Displays the list of available notebooks
  - Provides controls for creating, renaming, and deleting notebooks
  - Handles notebook selection

- **SectionTabs.tsx**
  - Displays tabs for navigating between sections in a notebook
  - Handles section creation, renaming, and deletion

- **PageList.tsx**
  - Shows pages within the selected section
  - Manages page selection, creation, and deletion

- **NoteCanvas.tsx**
  - Container for the block editor
  - Manages the active page content display

- **BlockEditor.tsx**
  - Manages the blocks in a page
  - Handles block creation, updating, and deletion
  - Manages block ordering and focus

- **BlockRenderer.tsx**
  - Responsible for rendering each block type (text, todo, heading, etc.)
  - Manages editing state for each block
  - Handles keyboard interactions and events

- **CommandMenu.tsx**
  - Provides the slash command menu for block creation and manipulation
  - Manages command filtering and selection

#### Component Interaction Flow

```
Mindboard ──► MindboardLayout ──┬─► MindboardSidebar
                                │
                                ├─► SectionTabs
                                │
                                ├─► PageList
                                │
                                └─► NoteCanvas ──► BlockEditor ──► BlockRenderer
                                                                      │
                                                                      ▼
                                                                  CommandMenu
```

#### State Management

The notebooks feature uses the `useMindboard` hook (in `src/hooks/useMindboard.tsx`), which provides:
- CRUD operations for notebooks, sections, pages, and blocks
- State for active entities and loading states
- Optimistic updates for real-time feedback
- Debounced saving for improved performance

### Projects Module

The Projects module offers task management with hierarchical organization.

#### Key Components

- **ProjectsPage.tsx**
  - Main container for the projects feature
  - Manages layout and active project selection

- **ProjectDetail.tsx**
  - Displays details for a selected project
  - Manages editing of project properties

- **ProjectTasksSection.tsx**
  - Displays tasks for a project
  - Provides task creation, editing, and filtering

- **TaskList.tsx**
  - Renders a list of tasks with filtering and sorting options
  - Handles task status changes

#### State Management

Projects use the `useProjects` hook for data fetching and manipulation, providing:
- CRUD operations for projects and tasks
- Status and priority management
- Assignment and due date handling

### Chat Assistant Module

The Chat Assistant (ActionBot) provides AI-powered assistance with context awareness.

#### Key Components

- **ChatLayout.tsx**
  - Main container for the chat interface
  - Manages layout between conversation sidebar and chat area

- **ConversationSidebar.tsx**
  - Displays conversation history
  - Allows creating new conversations and switching between them

- **ChatSection.tsx**
  - Renders the active conversation
  - Manages message input and submission

- **Message.tsx**
  - Renders individual chat messages with appropriate styling
  - Handles message actions and formatting

#### State Management

The chat functionality is powered by the `useChatMessages` hook, which:
- Manages conversation history and active conversation
- Handles message sending and receiving
- Integrates with OpenAI for AI responses
- Provides linking with tasks for context
- Manages streaming responses for real-time feedback

### Dashboard

The Dashboard (Command View) provides an overview of activity and quick actions.

#### Key Components

- **StatusOverview.tsx**
  - Displays summary metrics and status indicators
  - Shows progress on key metrics

- **AlertsPanel.tsx**
  - Shows notifications and alerts
  - Provides quick actions for addressing alerts

- **RecentTickets.tsx**
  - Displays recently viewed or modified tasks
  - Provides quick access to active work

- **UpcomingMeetings.tsx**
  - Shows scheduled meetings
  - Provides quick access to meeting details and notes

- **ActivityFeed.tsx**
  - Displays recent activity across the platform
  - Shows updates from team members

### Settings

The Settings module (Control Deck) provides user and workspace configuration.

#### Key Components

- **SettingsPage.tsx**
  - Main container for settings
  - Manages tabs for different setting categories

- **ProfileSettings.tsx**
  - Handles user profile configuration
  - Manages avatar and personal details

- **WorkspaceSettings.tsx**
  - Configures workspace properties
  - Manages team members and roles

- **IntegrationSettings.tsx**
  - Configures external service integrations
  - Manages API keys and connection status

## State Management

### React Query Implementation

Action.it uses React Query for server state management:

```typescript
// Example from useMindboard.tsx
const { 
  data: mindboards = [], 
  isLoading: isLoadingMindboards
} = useQuery({
  queryKey: ['mindboards'],
  queryFn: mindboardApi.getMindboards,
});
```

Benefits of this approach:
- Automatic caching and refetching
- Loading and error state management
- Deduplication of requests
- Background updates

### Local State Management

Component-specific state is managed using React's built-in hooks:
- `useState` for simple state
- `useReducer` for complex state logic
- `useContext` for shared state

```typescript
// Example from BlockEditor.tsx
const [orderedBlocks, setOrderedBlocks] = useState<MindBlock[]>([]);
const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
```

### Custom Hooks

The application uses custom hooks to encapsulate complex logic:

1. **useMindboard**
   - Manages notebook data and operations
   - Provides optimistic updates and error handling
   - Implements debounced saving for better performance

2. **useChatMessages**
   - Manages chat conversations and messages
   - Handles AI integration and streaming responses
   - Provides conversation linking with tasks

3. **useProjects**
   - Manages project and task data
   - Handles status and priority management
   - Provides filtering and sorting capabilities

## Data Flow Architecture

### Client-Server Communication

Data flow between client and server follows this pattern:

1. User initiates action (e.g., editing a block)
2. Local state updates immediately (optimistic update)
3. API request is debounced to prevent excessive calls
4. Request is sent to Supabase backend
5. React Query invalidates cached data on response
6. UI updates with confirmed server state

### Optimistic Updates

The application uses optimistic updates for a responsive user experience:

```typescript
// Simplified example from useMindboard.tsx
const updateBlockMutation = useMutation({
  mutationFn: async (block) => {
    // API call to update block
    return mindboardApi.updateMindBlock(block);
  },
  onMutate: async (updatedBlock) => {
    // Cancel outgoing requests
    await queryClient.cancelQueries({ queryKey: ['mind_blocks', activePageId] });
    
    // Snapshot previous state
    const previousBlocks = queryClient.getQueryData(['mind_blocks', activePageId]);
    
    // Optimistically update UI
    queryClient.setQueryData(['mind_blocks', activePageId], old => 
      old.map(block => block.id === updatedBlock.id ? { ...block, ...updatedBlock } : block)
    );
    
    return { previousBlocks };
  },
  onError: (error, _variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['mind_blocks', activePageId], context.previousBlocks);
    // Show error notification
  }
});
```

### Real-time Features

The application implements real-time features through:

1. **Streaming Responses**
   - Chat responses stream in real-time using async iterators
   - UI updates incrementally as content arrives

2. **Debounced Updates**
   - Input changes are debounced to prevent excessive API calls
   - Ensures smooth user experience during rapid input

## Backend Integration

### Supabase Architecture

Action.it uses Supabase as its backend platform with the following components:

1. **PostgreSQL Database**
   - Stores all application data
   - Leverages PostgreSQL's advanced features
   - Uses row-level security for data protection

2. **Authentication Service**
   - Handles user registration and login
   - Manages sessions and security
   - Provides JWT tokens for API authentication

3. **Storage Service**
   - Manages file uploads and storage
   - Handles image and file attachments

4. **Edge Functions**
   - Provides serverless execution for complex operations
   - Handles integrations with external services

### Authentication Flow

The authentication process follows these steps:

1. User signs up or logs in through the Auth UI
2. Supabase validates credentials and returns a JWT token
3. Token is stored in local storage
4. AuthContext provides user state throughout the application
5. API requests include the token for authentication
6. Supabase RLS policies enforce access control

### Database Access Patterns

The application follows these database access patterns:

1. **Direct Table Access**
   - Most operations use direct table access through Supabase client
   - RLS policies ensure data security

2. **Views and Functions**
   - Complex queries are encapsulated in PostgreSQL views
   - Special operations use database functions

3. **Transaction Management**
   - Multi-step operations use transactions for data consistency
   - Error handling includes proper rollback

### Edge Functions

Supabase Edge Functions extend the backend capabilities:

1. **AI Integration**
   - Handle OpenAI API calls securely
   - Process and stream AI responses

2. **External Integrations**
   - Connect with third-party services
   - Handle webhooks and callbacks

3. **Complex Processing**
   - Perform operations too complex for client-side
   - Generate summaries and analytics

## UI/UX Implementation

### Component Design System

Action.it uses a component-based design system built on:

1. **Shadcn/UI**
   - Base component library
   - Customized with project-specific styling

2. **Custom Components**
   - Extended components for specific needs
   - Consistent styling and behavior

3. **Component Composition**
   - Complex interfaces built from simpler components
   - Props drilling for configuration

### Theming & Styling

The application employs a distinctive visual style:

1. **Core Theme Elements**
   - Futuristic design with deep teals and steel blues
   - Vibrant purple and orange accents
   - Dark mode as primary theme with light mode option
   - High contrast for readability

2. **Implementation**
   - Tailwind CSS for styling
   - CSS variables for theme values
   - Custom utility classes for common patterns

```css
/* Example theme variables */
:root {
  --background: #182635;
  --foreground: #F1F5F9;
  --primary: #00F7EF;
  --secondary: #BD00FF;
  --accent: #FF7A00;
  --muted: #3A4D62;
  --border: #1C2A3A;
}
```

### Animations & Transitions

The interface uses animations for a dynamic experience:

1. **Framer Motion**
   - Page transitions
   - Component animations
   - Interactive elements

2. **CSS Transitions**
   - Hover effects
   - Focus states
   - Color transitions

3. **Micro-interactions**
   - Button feedback
   - Loading indicators
   - Status changes

### Responsive Design

The application is built mobile-first with:

1. **Responsive Layouts**
   - Flexible grids and containers
   - Breakpoint-specific styling

2. **Adaptive Components**
   - Components that transform based on screen size
   - Mobile-optimized interfaces

3. **Touch-friendly Interactions**
   - Large touch targets
   - Swipe gestures
   - Bottom navigation on mobile

## Advanced Features

### Block Editor Engine

The notebook's block editor is a sophisticated system:

1. **Block Types**
   - Text blocks with rich formatting
   - To-do lists with checkboxes
   - Headings (H1, H2, H3)
   - Lists (bullet and numbered)
   - Code blocks with syntax highlighting
   - Media blocks (images, embedded content)
   - Special blocks (callouts, dividers)

2. **Block Operations**
   - Creation via keyboard shortcuts or command menu
   - Conversion between block types
   - Drag-and-drop reordering
   - Indentation and nesting

3. **Editing Features**
   - Inline editing with auto-focus
   - Keyboard navigation
   - Markdown shortcuts

4. **Block Design**
   - Block-based data model
   - JSON content storage
   - Position-based ordering

### AI Assistant Integration

The ActionBot assistant provides intelligent help:

1. **Context Awareness**
   - Task context integration
   - Conversation history awareness
   - User profile knowledge

2. **Response Generation**
   - OpenAI API integration
   - Streaming response display
   - Message formatting

3. **Specialized Assistants**
   - Multiple assistant personalities
   - Domain-specific knowledge
   - Configurable capabilities

### Command System

The application offers command-based interactions:

1. **Slash Commands**
   - Block creation and manipulation
   - Quick actions within editors
   - Format application

2. **Keyboard Shortcuts**
   - Navigation shortcuts
   - Editing shortcuts
   - Action shortcuts

3. **Command Palette**
   - Application-wide command access
   - Search and filter commands
   - Shortcut display

## Error Handling & Logging

### Error Boundaries

React error boundaries prevent UI crashes:

```typescript
// Simplified error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error("Error caught by boundary:", error, info);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Toast Notifications

User feedback uses toast notifications:

```typescript
// Example toast usage
const { toast } = useToast();

const handleError = (error) => {
  toast({
    title: "Error",
    description: error.message || "An unexpected error occurred",
    variant: "destructive"
  });
};
```

### Logging Strategy

The application employs a comprehensive logging approach:

1. **Console Logging**
   - Development debugging
   - Important operations
   - State transitions

2. **Error Logging**
   - Caught exceptions
   - API errors
   - Authentication issues

3. **User Action Logging**
   - Critical user actions
   - System events
   - Performance metrics

## Development Guidelines

### Component Creation

Follow these guidelines when creating new components:

1. **Single Responsibility**
   - Each component should do one thing well
   - Break complex components into smaller ones

2. **Composition Over Inheritance**
   - Build complex UIs by composing simple components
   - Use higher-order components and render props when appropriate

3. **File Organization**
   - Create one component per file
   - Group related components in feature directories

4. **Naming Conventions**
   - Use PascalCase for component names
   - Match file names to component names

### Coding Standards

Adhere to these coding standards:

1. **TypeScript Usage**
   - Define proper interfaces and types
   - Avoid `any` type when possible
   - Use generics for reusable code

2. **Component Structure**
   - Props at the top
   - Hooks and state next
   - Helper functions after
   - Return statement last

3. **State Management**
   - Use React Query for server state
   - Use local state for UI state
   - Use context for shared state
   - Avoid prop drilling with custom hooks

4. **Comments and Documentation**
   - Document complex logic
   - Add JSDoc comments to functions
   - Keep inline comments minimal but helpful

### Debugging Practices

Use these debugging practices:

1. **Console Logging**
   - Log important state changes
   - Include context in log messages
   - Use structured logging for complex objects

2. **React DevTools**
   - Inspect component props and state
   - Monitor render cycles
   - Profile performance

3. **Network Monitoring**
   - Watch API requests and responses
   - Check for failed requests
   - Monitor request timing

### Performance Optimization

Apply these performance techniques:

1. **Memoization**
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for stable function references
   - Use `React.memo` for pure components

2. **Data Fetching**
   - Use proper React Query cache invalidation
   - Implement pagination for large datasets
   - Preload critical data

3. **Rendering Optimization**
   - Virtualize long lists
   - Lazy load components
   - Debounce input handlers

## Appendix

### Glossary

- **Notebook**: A collection of related sections and pages (formerly Mindboard)
- **Section**: A grouping of pages within a notebook
- **Page**: A document containing blocks
- **Block**: An individual content unit (text, todo, image, etc.)
- **Project**: A task management container (formerly Mission)
- **Task**: An individual work item
- **ActionBot**: The AI assistant feature
- **Command View**: The main dashboard

### File Structure Map

```
src/
├── api/               # API integration layer
│   ├── mindboard.ts   # Notebook API operations
│   ├── projects.ts    # Projects API operations
│   └── ...
├── components/        # React components by feature
│   ├── mindboard/     # Notebook components
│   │   ├── Mindboard.tsx
│   │   ├── BlockEditor.tsx
│   │   ├── BlockRenderer.tsx
│   │   └── ...
│   ├── projects/      # Project components
│   └── ...
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
└── utils/             # Utility functions
```

### Common Patterns

1. **Data Fetching**
```typescript
// Using React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['resource-name', id],
  queryFn: () => api.getResource(id)
});
```

2. **Data Mutation**
```typescript
// Using React Query for mutations
const mutation = useMutation({
  mutationFn: (data) => api.updateResource(data),
  onSuccess: () => {
    // Update cache or show success message
    queryClient.invalidateQueries(['resource-name']);
  }
});
```

3. **Component Structure**
```typescript
// Standard component structure
function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Logic
  };
  
  // Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Helper functions
  const computeValue = () => {
    // Logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

4. **Conditional Rendering**
```typescript
// Standard pattern for conditional rendering
function ConditionalComponent({ data, isLoading, error }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage error={error} />;
  }
  
  if (!data) {
    return <EmptyState />;
  }
  
  return (
    <div>{/* Render data */}</div>
  );
}
```
