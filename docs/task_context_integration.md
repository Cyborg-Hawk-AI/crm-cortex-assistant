# Task Context Integration in ActionIt Chat System

## Overview

This document provides a comprehensive explanation of how project and task information is integrated into the AI chat system in ActionIt. It details the flow of task information from database to the conversation context, ensuring that when users link a task to a conversation, the AI assistant has complete knowledge of that task's details.

## System Architecture

The task context integration follows this general architecture:

1. **Database Layer**: Task information is stored in the Supabase `tasks` table
2. **API Layer**: Task data is retrieved via the tasks API
3. **Context Integration Layer**: Task data is formatted and injected into conversation context
4. **OpenAI Integration Layer**: Task context is sent to OpenAI as part of system prompts and conversation history
5. **UI Layer**: Users can link tasks to conversations and interact with an AI that has task context

## Detailed Flow

### 1. Task Linking Process

When a user links a task to a conversation:

1. The user selects a task to link via the UI
2. The `linkTaskToConversation` or `linkMissionToConversation` function is called in `useChatMessages.tsx`
3. The task ID is stored in the `conversations` table in Supabase, associating it with the current conversation
4. A system message is created and added to the conversation with comprehensive task details
5. This message becomes part of the conversation history for future context

### 2. Task Data Retrieval

When loading a conversation with a linked task:

1. `useChatMessages.tsx` detects the task_id in the conversation record
2. It queries the Supabase `tasks` table to get the full task object
3. The retrieved task is stored in the `linkedTask` state variable
4. A system message containing task details is added if not already present

### 3. Task Context Formatting

The system creates rich context for the task in multiple ways:

```typescript
// In useChatMessages.tsx
const taskMessage = `Task linked: ${task.title} (Status: ${task.status}, Priority: ${task.priority})
Description: ${task.description || 'No description provided'}
Due date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(task.updated_at).toLocaleString()}`;
```

```typescript
// In assistantService.ts
const formatTaskDetails = (task: Task | null): string => {
  if (!task) return '';
  
  let taskDetails = `
TASK DETAILS:
- Title: ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
`;

  if (task.description && task.description.trim()) {
    taskDetails += `- Description: ${task.description}\n`;
  }
  
  if (task.due_date) {
    taskDetails += `- Due Date: ${new Date(task.due_date).toLocaleDateString()}\n`;
  }
  
  if (task.assignee_id) {
    taskDetails += `- Assigned To: ${task.assignee_id}\n`;
  }
  
  if (task.parent_task_id) {
    taskDetails += `- Part of Mission: ${task.parent_task_id}\n`;
  }

  taskDetails += `- Last Updated: ${new Date(task.updated_at).toLocaleString()}\n`;
  
  return taskDetails;
};
```

### 4. Integrating Task Context into OpenAI Prompts

The task information is integrated into the AI conversation in multiple ways:

#### 4.1 System Messages

When a task is linked, a system message is added to the conversation and stored in the database:

```typescript
// In useChatMessages.tsx - linkMissionToConversation function
// Format the task information for the system message with more details
const taskMessage = `Task linked: ${mission.title} (Status: ${mission.status}, Priority: ${mission.priority})
Description: ${mission.description || 'No description provided'}
Due date: ${mission.due_date ? new Date(mission.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(mission.updated_at).toLocaleString()}`;

await saveMessage(
  taskMessage,
  'system',
  uuidv4(),
  activeConversationId
);
```

#### 4.2 Enhanced System Prompt

When sending messages to OpenAI, the task context is included in the system prompt:

```typescript
// In useChatMessages.tsx - sendMessage function
// Add detailed task information to the system prompt if a task is linked
if (linkedTask) {
  systemPrompt += `\n\nIMPORTANT: This conversation is related to the following task:\n`+
    `- Title: ${linkedTask.title}\n`+
    `- Status: ${linkedTask.status}\n`+
    `- Priority: ${linkedTask.priority}\n`+
    `- Description: ${linkedTask.description || 'No description provided'}\n`+
    `- Due Date: ${linkedTask.due_date ? new Date(linkedTask.due_date).toLocaleDateString() : 'No due date'}\n`+
    `- Last Updated: ${new Date(linkedTask.updated_at).toLocaleString()}\n\n`+
    `When asked about this task, provide complete information. You should remember these details for the entire conversation.`;
}
```

#### 4.3 Thread Context in assistantService

In the assistantService, task information is added to the OpenAI thread context:

```typescript
// In assistantService.ts - sendMessage function
// Include comprehensive task information in the prompt when available
let taskContext = '';
if (task) {
  taskContext = `
COMPREHENSIVE TASK INFORMATION:
- Title: ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
- Description: ${task.description || 'No description provided'}
- Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
- Last Updated: ${new Date(task.updated_at).toLocaleString()}

When asked about this task, provide complete information based on the above details.
Please always remember these details for the entire conversation.
`;
}

// Create a properly formatted prompt with the assistant's prompt, context and task information
const formattedPrompt = `
${assistantConfig.prompt}

${assistantConfig.contextPrompt}

${taskContext ? 'ASSOCIATED TASK INFORMATION:\n' + taskContext + '\n' : ''}

Conversation History:
${historyForContext}

Current Query: ${content}
`;
```

#### 4.4 Thread Run Instructions

When running the OpenAI assistant on a thread, task details are included in the instructions:

```typescript
// In assistantService.ts - sendMessage function
// Prepare instructions for the assistant run
let instructions = assistantConfig.contextPrompt;
if (task) {
  instructions += `\n\nThis conversation is about the following task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}.`;
  if (task.description) {
    instructions += ` Description: ${task.description}`;
  }
  instructions += ` Last updated: ${new Date(task.updated_at).toLocaleString()}`;
}
```

### 5. Maintaining Context Across Messages

To ensure the task context persists across the entire conversation:

1. The system message containing task details is stored in the database
2. Each new message sent to OpenAI includes the full conversation history
3. The linkedTask state is maintained throughout the chat session
4. The task context is injected into every prompt sent to OpenAI

## Troubleshooting Task Context Issues

If the AI is not recognizing task information correctly, check the following:

1. **Database Connection**: Verify the task is properly linked in the `conversations` table
2. **System Message**: Ensure the system message with task details is present in the conversation history
3. **Context Sending**: Check that the task context is being included in the prompts sent to OpenAI
4. **Message History**: Confirm that the full conversation history including the system message is being sent
5. **Token Limits**: Make sure the conversation isn't exceeding OpenAI's token limits, which could truncate context
6. **Conversation Initialization**: Verify that when loading a conversation with a linked task, the task details are properly loaded

## Implementation Locations

The task context integration is primarily implemented in these files:

1. `src/hooks/useChatMessages.tsx` - Handles linking tasks and projects, loading task data, and formatting system prompts
2. `src/services/assistantService.ts` - Formats task details for OpenAI and includes them in API calls
3. `src/api/projects.ts` - Provides access to project and task data from the database

## Recent Enhancements

Recent improvements to the task context system include:

1. Enhanced system prompt formatting with more comprehensive task details
2. Multiple points of context injection to ensure the AI retains task information
3. Explicit instructions for the AI to reference task details when answering queries
4. Additional formatting of task information to make it more prominent in the context

## Conclusion

The ActionIt chat system uses multiple layers of context integration to ensure that linked task information is properly included in conversations. By injecting task details into system prompts, conversation history, and special instructions, the system ensures that the AI assistant has full knowledge of relevant task information throughout the conversation.
