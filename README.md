
# Action.it - AI-Powered CRM and Ticket Management

Action.it is a comprehensive AI-powered CRM and ticket management system that integrates with various services like Notion to enhance productivity and streamline workflow.

## Features

### AI Assistant Integration
- Multiple specialized AI assistants (Code, Documentation, Security, Customer Service, etc.)
- Real-time AI chat with context awareness
- Task linking and context sharing with AI assistants
- Natural language processing for task creation, meeting scheduling, and more

### Task Management
- Create, view, and manage tasks
- Link tasks to contacts, meetings, and conversations
- Set priorities, due dates, and assign tasks to team members
- Tag and categorize tasks for better organization

### Meeting Management
- Schedule meetings with multiple attendees
- Link meetings to tasks and contacts
- Set agenda, duration, and meeting links
- Calendar integration (via Notion and other services)

### Contact Management
- Maintain a comprehensive contact database
- Associate contacts with tasks and meetings
- Track communication history
- Tag and categorize contacts

### Notion Integration
- Sync tasks, notes, and meetings with Notion
- Search Notion content directly from the app
- Import Notion database content

### Data Model

The application uses a comprehensive data model that includes:

- **Conversations**: Track chat threads between users and AI assistants
- **Chat Messages**: Individual messages within conversations
- **Tasks**: Actionable items with status, priority, due dates
- **Contacts**: Customer and stakeholder information
- **Meetings**: Scheduled events with attendees and agendas
- **Notes**: Context and information linked to tasks and meetings
- **Activities**: Audit log of all actions within the system

## Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations
- React Query for data fetching and caching

### Backend
- Supabase for database, authentication, and storage
- PostgreSQL database with RLS policies
- OpenAI integration for AI assistants

### Authentication
- Supabase Auth for user management
- Row-level security for data access control

### API Integration
- OpenAI API for AI assistant capabilities
- Notion API for document and task integration
- Optional integrations with other services (Salesforce, Freshservice, etc.)

## Development Setup

### Prerequisites
- Node.js 14+
- npm or yarn
- Supabase account
- OpenAI API key

### Configuration
1. Deploy the SQL schema to your Supabase instance
2. Add your OpenAI API key to Supabase secrets
3. Configure the OpenAI assistants in the assistants table
4. Connect your Notion workspace (optional)

### Environment Variables
- OPENAI_API_KEY: Your OpenAI API key
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_ANON_KEY: Your Supabase anonymous key
- NOTION_API_KEY: Your Notion API key (optional)

## Deployment

The application can be deployed to any static hosting service, with Supabase providing the backend functionality.

## Extending the Application

### Adding New Assistants
Add new assistant configurations to the assistants table in Supabase, including:
- Assistant ID
- Name
- Description
- Capabilities
- OpenAI Assistant ID

### Custom Integrations
The application is designed to be extended with additional integrations:
1. Create a new integration module in `src/integrations/[provider]/`
2. Implement the required API functions
3. Add UI components to configure and use the integration

## License
This project is licensed under the MIT License.
