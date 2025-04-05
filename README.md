# Action.it - Internal Documentation

## Overview
Action.it is a comprehensive productivity and collaboration platform built with modern web technologies. This documentation is for internal use and provides detailed information about the system architecture, features, and development guidelines.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: OpenAI API
- **External Integrations**: Notion API
- **Development Tools**: Vite, ESLint, Prettier

## Core Features

### Authentication & User Management
- Supabase-based authentication system
- User profiles and team management
- Role-based access control
- Secure password management

### Dashboard & Navigation
- Real-time status overview
- Activity feed and alerts
- Responsive navigation system
- Quick access to key features

### Task & Project Management
- Hierarchical task organization
- Subtask support
- Due dates and priorities
- Assignment and tracking
- Integration with Notion

### Mindboard Knowledge Management
- Hierarchical organization (Mindboards > Sections > Pages > Blocks)
- Rich content types:
  - Text blocks with formatting
  - To-do lists with checkboxes
  - Headings and lists
  - Code blocks with syntax highlighting
  - Media blocks (images, files, embeds)
- Advanced editing features:
  - Keyboard shortcuts and navigation
  - Block type conversion
  - Rich text paste support
  - Smooth UI transitions
  - Focus management

### Meeting Management
- Calendar integration
- Attendee management
- Meeting notes and follow-ups
- Quick action buttons

### Contact Management
- Customer/contact profiles
- Interaction history
- Team assignment
- Integration with tasks

### Chat Assistant
- AI-powered conversations
- Multiple specialized assistants
- Conversation history
- Context-aware responses

### Scratchpad Notes
- Quick note-taking
- Notebook organization
- Rich text support
- Real-time saving

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
- Node.js 18+
- PostgreSQL 14+
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
