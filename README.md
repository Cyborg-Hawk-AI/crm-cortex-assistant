
# Action.it - Internal Documentation

## Overview
Action.it is a comprehensive productivity platform that combines task management, knowledge organization, and AI assistance into a unified workspace. Built with modern web technologies, it provides a seamless experience for managing projects, notes, meetings, and team collaboration.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: OpenAI API
- **External Integrations**: Notion API
- **Development Tools**: Vite, ESLint, Prettier
- **State Management**: React Query, React Context
- **UI Framework**: Shadcn/UI with Tailwind CSS
- **Animation**: Framer Motion
- **Date Handling**: date-fns
- **Markdown**: marked, turndown
- **Code Editor**: Monaco Editor

## Core Features

### Notebooks (formerly Mindboard)
A powerful knowledge management system that provides a flexible and intuitive way to organize and work with information.

#### Key Components
1. **Block-Based Editor**
   - Rich text editing with multiple block types
   - Markdown support and shortcuts
   - Real-time formatting
   - Drag-and-drop reordering

2. **Block Types**
   - Text blocks with rich formatting
   - To-do lists with checkboxes
   - Headings (H1, H2, H3)
   - Bullet and numbered lists
   - Code blocks with syntax highlighting
   - Media blocks (images, files, embeds)

3. **Navigation & Organization**
   - Hierarchical structure (Notebooks > Sections > Pages)
   - Collapsible sidebar
   - Section tabs
   - Page list with search
   - Recent pages

4. **Editing Features**
   - Keyboard shortcuts
   - Slash commands
   - Markdown shortcuts
   - Block type conversion
   - Property inheritance
   - Focus management

### Project Management
- Task and project organization
- Subtask support
- Priority levels and status tracking
- Due dates and assignments
- Project timeline views
- Task board (Kanban) view
- Team collaboration features

### AI Assistant (ActionBot)
- Context-aware AI conversations
- Project and task integration
- Markdown formatting support
- Conversation history
- Multiple specialized assistants
- Real-time responses

### Command View (Dashboard)
- Status overview
- Recent tasks and notes
- Upcoming meetings
- Activity feed
- Quick actions
- Alerts panel

### Control Deck (Settings)
- User preferences
- Workspace configuration
- Integration settings
- Team management
- Security settings

### Meeting Management
- Schedule creation
- Attendee management
- Meeting notes
- Calendar integration
- Quick actions

## Database Architecture
- PostgreSQL with Supabase
- Row-level security
- Comprehensive data model
- Real-time subscriptions
- Automated backups
- Performance optimized

## Security Features
- JWT-based authentication
- Role-based access control
- Row-level security policies
- Secure password handling
- Email verification
- Session management

## Development Guidelines

### Code Organization
```
src/
├── api/           # API integration and services
├── components/    # React components
│   ├── ui/       # Reusable UI components
│   └── [feature]/ # Feature-specific components
├── contexts/     # React contexts
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── pages/        # Page components
└── utils/        # Helper functions
```

### State Management
- React Query for server state
- React Context for application state
- Custom hooks for feature logic
- Local state for UI components

### Component Guidelines
1. **Structure**:
   - Functional components with TypeScript
   - Single responsibility principle
   - Modular design
   - Clean architecture

2. **Styling**:
   - Tailwind CSS classes
   - Shadcn/UI patterns
   - Consistent theming
   - Mobile-first design

### Performance Optimization
- Optimized database queries
- Efficient state management
- Code splitting
- Lazy loading
- Caching strategies

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Initialize Supabase
5. Run development server: `npm run dev`

### Development Workflow
1. Create feature branch
2. Implement changes
3. Run tests
4. Submit PR
5. Code review
6. Merge to main

## Support
For internal support:
- Documentation: Confluence
- Issue tracking: GitHub Issues
- Team chat: Slack

## License
Internal use only. All rights reserved.
