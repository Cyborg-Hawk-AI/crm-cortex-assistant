# Action.it - Modern CRM & Productivity Platform

Action.it is a comprehensive CRM and productivity platform that combines task management, note-taking, and communication tools into a single, intuitive interface. Built with modern web technologies, it offers a seamless experience for managing contacts, tasks, meetings, and knowledge.

## 🚀 Features

### Core Features
- **Task Management**: Full task and subtask system with assignees, due dates, and status tracking
- **Contact Management**: Comprehensive contact database with custom fields and activity history
- **Meeting Management**: Schedule and manage meetings with attendee tracking
- **Knowledge Management**: Rich text editor with Notion-like block editing
- **Chat Assistant**: AI-powered chat system with specialized assistants
- **Scratchpad Notes**: Quick note-taking with persistent storage

### Mindboard (Knowledge Management)
- **Hierarchical Organization**: Mindboards → Sections → Pages → Blocks
- **Rich Content Types**: Text, headings, to-do lists, code blocks, images, and more
- **Intuitive Editing**: 
  - Shift+Enter for list continuation
  - Markdown shortcuts
  - Slash commands
  - Rich text paste support
- **Smart Navigation**: Keyboard shortcuts, block selection, and smooth scrolling

### Integrations
- **Notion**: Sync tasks and notes with Notion workspaces
- **Supabase**: Secure database backend with real-time capabilities
- **OpenAI**: AI-powered chat and assistance

## 🛠️ Technology Stack

### Frontend
- **React**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/UI**: Beautiful, accessible components
- **Framer Motion**: Smooth animations
- **Monaco Editor**: Code block editing

### Backend
- **Supabase**: Authentication, database, and real-time features
- **PostgreSQL**: Robust data storage
- **OpenAI API**: AI capabilities

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/action.it.git
   cd action.it
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and OpenAI credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Database Schema
The application uses a PostgreSQL database with tables for:
- `conversations` & `chat_messages`
- `tasks` & `subtasks`
- `contacts`
- `meetings` & `meeting_attendees`
- `notes`
- `activities` (audit log)
- `assistants` (OpenAI configurations)
- `user_settings`
- `app_configuration`

### State Management
- **React Query**: Server state management
- **React Context**: Auth and application state
- **Custom Hooks**: Feature-specific functionality

## 🎯 Key Components

### Block Editor
- **Rich Text Editing**: Support for multiple content types
- **Keyboard Navigation**: Intuitive shortcuts and commands
- **Focus Management**: Smart cursor positioning
- **UI Polish**: Smooth transitions and visual feedback

### Task Management
- **Hierarchical Tasks**: Support for subtasks
- **Assignment System**: Team collaboration
- **Due Date Tracking**: Calendar integration
- **Status Updates**: Progress tracking

### Chat System
- **Multiple Assistants**: Specialized AI helpers
- **Conversation History**: Persistent chat storage
- **Real-time Updates**: Live message delivery
- **Context Awareness**: Smart response generation

## 🔧 Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Husky for git hooks

### Testing
- Jest for unit tests
- React Testing Library for components
- Cypress for end-to-end tests

## 📝 Documentation

- [Feature Index](docs/FEATURE_INDEX.md): Comprehensive feature documentation
- [API Reference](docs/API.md): API endpoints and usage
- [Component Guide](docs/COMPONENTS.md): UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.io) for the backend infrastructure
- [OpenAI](https://openai.com) for AI capabilities
- [Shadcn/UI](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for styling
