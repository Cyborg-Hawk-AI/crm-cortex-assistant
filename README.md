# Action.it - Internal Documentation

## Overview
Action.it is a comprehensive productivity platform that combines task management, knowledge organization, and AI assistance into a unified workspace. Built with modern web technologies, it provides a seamless experience for managing tasks, notes, meetings, and team collaboration.

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

### Mindboards Knowledge Management
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
   - Hierarchical structure (Mindboards > Sections > Pages)
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

5. **UI/UX Features**
   - Responsive design
   - Visual feedback
   - Smooth transitions
   - Touch support
   - Loading states

#### Technical Implementation
- **Components**:
  - `Mindboard.tsx`: Main container
  - `BlockEditor.tsx`: Rich text editor
  - `BlockRenderer.tsx`: Block rendering
  - `PageList.tsx`: Page management
  - `SectionTabs.tsx`: Section navigation
  - `MindboardSidebar.tsx`: Sidebar
  - `NoteCanvas.tsx`: Note canvas
  - `NotebookSidebar.tsx`: Notebook navigation

- **State Management**:
  - React Query for data
  - Context for UI state
  - Local state for editing
  - Optimistic updates

- **Performance**:
  - Virtual scrolling
  - Lazy loading
  - Caching strategies
  - Debounced updates

- **Security**:
  - Content sanitization
  - Access control
  - Data validation
  - Error handling

#### Recent Enhancements
- Shift+Enter support for lists
- Improved block creation
- Enhanced keyboard navigation
- Rich text paste support
- UI/UX polish

#### Planned Features
- Real-time collaboration
- Block templates
- Advanced formatting
- Version history
- Custom block types
- Block comments
- Block linking
- Search and filtering

### Other Core Features
- **Authentication & User Management**: Secure user authentication and profile management
- **Dashboard & Navigation**: Real-time status overview and quick access to features
- **Task & Project Management**: Hierarchical task organization with subtasks
- **Meeting Management**: Calendar integration and attendee management
- **Contact Management**: Customer/contact profiles and interaction history
- **Chat Assistant**: AI-powered conversations with specialized assistants
- **Scratchpad Notes**: Quick note-taking with rich text support

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
├── services/     # Business logic
├── types/        # TypeScript types
└── utils/        # Helper functions
```

### State Management
- React Query for server state
- React Context for application state
- Custom hooks for feature logic
- Local state for UI components

### Database Schema
Key tables include:
- `conversations` & `chat_messages`
- `tasks` & `subtasks`
- `contacts`
- `meetings` & `meeting_attendees`
- `notes`
- `activities` (audit log)
- `assistants` (OpenAI configurations)
- `user_settings`
- `app_configuration`

### Component Guidelines
1. **Structure**:
   - Use functional components
   - Implement proper TypeScript types
   - Follow single responsibility principle

2. **Styling**:
   - Use Tailwind CSS classes
   - Follow Shadcn/UI patterns
   - Maintain consistent spacing and colors

3. **State Management**:
   - Use appropriate state management solution
   - Implement proper error handling
   - Follow React best practices

### Testing
- Unit tests for utilities and hooks
- Integration tests for features
- E2E tests for critical paths
- Regular code reviews

## Recent Updates

### Mindboard Enhancements
- Added Shift+Enter support for lists
- Improved block creation and focus
- Enhanced keyboard navigation
- Added rich text paste support
- Improved UI/UX polish

### Performance Improvements
- Optimized database queries
- Enhanced state management
- Improved component rendering
- Added caching strategies

### Security Updates
- Enhanced authentication
- Improved data validation
- Added input sanitization
- Updated dependencies

## Planned Features
- [ ] Real-time collaboration
- [ ] Block templates
- [ ] Advanced formatting
- [ ] Version history
- [ ] Custom block types
- [ ] Block comments
- [ ] Block linking
- [ ] Search and filtering

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

## Troubleshooting

### Common Issues
- Authentication problems
- Database connection issues
- API rate limits
- Performance bottlenecks

### Solutions
- Check environment variables
- Verify database connections
- Monitor API usage
- Profile performance

## Support
For internal support:
- Slack channel: #action-it-dev
- Email: dev-support@action.it
- Documentation: Confluence

## License
Internal use only. All rights reserved.
