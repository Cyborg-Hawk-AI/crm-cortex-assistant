
# Enhanced Task Context Integration Design

## Current Issues and Solutions

### Problem Identification

After careful review of the existing task context integration, several areas for improvement have been identified:

1. **Inconsistent Context Retention**: The AI sometimes loses track of task details during long conversations.
2. **Formatting Inconsistency**: Task information is formatted differently across different parts of the system.
3. **Token Consumption**: Full task details consume significant tokens that could be used for conversation.
4. **Context Dilution**: Task information may get diluted as conversation history grows.
5. **Limited Diagnostics**: There's insufficient logging to diagnose context-related issues.

### Proposed Solutions

#### 1. Standardized Task Context Format

Create a consistent format for project and task information across all integration points:

```typescript
// Standardized format function to be used everywhere task context is needed
export const formatTaskContext = (task: Task): string => {
  if (!task) return '';
  
  return `
PROJECT/TASK REFERENCE [#${task.id.substring(0, 8)}]:
• Title: ${task.title}
• Status: ${task.status.toUpperCase()}
• Priority: ${task.priority.toUpperCase()}${task.description ? `
• Description: ${task.description.length > 200 
    ? task.description.substring(0, 200) + '...' 
    : task.description}` : ''}${task.due_date ? `
• Due: ${new Date(task.due_date).toLocaleDateString()}` : ''}
• Updated: ${new Date(task.updated_at).toLocaleString()}
`;
};
```

#### 2. Multi-layer Context Integration

Implement a three-layer approach to ensure task context is always available:

1. **Persistent System Message**: Store a comprehensive system message with task details in the conversation history.
2. **Context Prefixing**: Add a concise task reminder at the beginning of each API call.
3. **Instruction Augmentation**: Include task-specific instructions in the OpenAI prompt instructions.

#### 3. Context Refreshing Strategy

Implement a strategy to refresh task context periodically during long conversations:

1. Monitor conversation length and re-inject task context after every N messages.
2. Add context refresher when detecting task-related questions without recent task context.

#### 4. Dynamic Detail Level

Adjust the level of detail based on conversation needs:

1. Use concise task summaries for normal conversation turns.
2. Inject comprehensive details when the user explicitly asks about the task.
3. Scale back details as token usage approaches limits.

#### 5. Enhanced Diagnostics

Add diagnostic capabilities to monitor and debug context integration:

```typescript
// Example logging function for context monitoring
const logTaskContextIntegration = (
  conversationId: string,
  taskId: string | null,
  contextIncluded: boolean,
  contextFormat: 'system' | 'prompt' | 'instructions',
  contextLength: number
) => {
  console.log(
    `Task Context [${contextFormat}] for conversation ${conversationId}: ` +
    `${taskId ? `Task ${taskId} included` : 'No task'}, ` +
    `${contextLength} characters, included=${contextIncluded}`
  );
};
```

## Implementation Plan

### 1. Refactor Context Formatting

Create a dedicated utility for task context formatting:

```typescript
// src/utils/taskContextFormatter.ts
import { Task } from '@/utils/types';

export enum TaskContextDetailLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive'
}

export const formatTaskContext = (
  task: Task | null, 
  detailLevel: TaskContextDetailLevel = TaskContextDetailLevel.STANDARD
): string => {
  if (!task) return '';
  
  switch (detailLevel) {
    case TaskContextDetailLevel.MINIMAL:
      return `Task: ${task.title} (${task.status}, ${task.priority})`;
      
    case TaskContextDetailLevel.COMPREHENSIVE:
      // Include all possible task details
      return `
COMPREHENSIVE TASK REFERENCE [#${task.id.substring(0, 8)}]:
• Title: ${task.title}
• Status: ${task.status.toUpperCase()}
• Priority: ${task.priority.toUpperCase()}
• Description: ${task.description || 'None provided'}
• Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
• Assignee: ${task.assignee_id || 'Unassigned'}
• Reporter: ${task.reporter_id || 'Unknown'}
• Tags: ${task.tags && task.tags.length > 0 ? task.tags.join(', ') : 'None'}
• Parent Task: ${task.parent_task_id || 'None'}
• Created: ${new Date(task.created_at).toLocaleString()}
• Updated: ${new Date(task.updated_at).toLocaleString()}
`;
      
    case TaskContextDetailLevel.STANDARD:
    default:
      // Balance between conciseness and completeness
      return `
TASK REFERENCE [#${task.id.substring(0, 8)}]:
• Title: ${task.title}
• Status: ${task.status.toUpperCase()}
• Priority: ${task.priority.toUpperCase()}${task.description ? `
• Description: ${task.description.length > 150 
    ? task.description.substring(0, 150) + '...' 
    : task.description}` : ''}${task.due_date ? `
• Due: ${new Date(task.due_date).toLocaleDateString()}` : ''}
• Updated: ${new Date(task.updated_at).toLocaleString()}
`;
  }
};

// Log task context integration points
export const logTaskContext = (
  stage: 'system-message' | 'prompt-inclusion' | 'instructions',
  conversationId: string, 
  taskId: string | null,
  included: boolean,
  contextSize: number
) => {
  console.log(
    `[TaskContext:${stage}] Conv:${conversationId.substring(0, 8)} ` +
    `Task:${taskId ? taskId.substring(0, 8) : 'none'} ` +
    `Included:${included} Size:${contextSize}`
  );
};
```

### 2. Enhance System Message Integration

Update how system messages with task context are created and managed:

```typescript
// In useChatMessages.tsx
const ensureTaskSystemMessage = async (task: Task, conversationId: string): Promise<void> => {
  // Check if a system message for this task already exists
  const existingTaskMessage = messages.find(msg => 
    msg.isSystem && 
    msg.content.includes(`TASK REFERENCE [#${task.id.substring(0, 8)}]`)
  );
  
  if (!existingTaskMessage) {
    // Create a new system message with standardized formatting
    const taskContext = formatTaskContext(task, TaskContextDetailLevel.COMPREHENSIVE);
    
    await saveMessage(
      `This conversation is linked to the following task:\n\n${taskContext}\n\nRefer to this information when discussing this task.`,
      'system',
      uuidv4(),
      conversationId
    );
    
    logTaskContext('system-message', conversationId, task.id, true, taskContext.length);
  }
};
```

### 3. Update OpenAI Integration

Enhance how task context is included in OpenAI calls:

```typescript
// In sendMessage function of useChatMessages.tsx or assistantService.ts

// Create thread history with task context injection
const prepareMessagesForOpenAI = (messages: Message[], task: Task | null): any[] => {
  const messageHistory = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 
          msg.sender === 'system' ? 'system' : 'assistant',
    content: msg.content
  }));
  
  // Add system message at beginning with task context if we have a task
  if (task && !messageHistory.some(msg => 
    msg.role === 'system' && 
    msg.content.includes(`TASK REFERENCE [#${task.id.substring(0, 8)}]`)
  )) {
    const taskContext = formatTaskContext(task, TaskContextDetailLevel.STANDARD);
    
    messageHistory.unshift({
      role: 'system',
      content: `This conversation involves the following task:\n\n${taskContext}\n\nRefer to this information when answering questions about the task.`
    });
    
    logTaskContext('prompt-inclusion', conversationId, task.id, true, taskContext.length);
  }
  
  return messageHistory;
};
```

### 4. Add Context to Model Instructions

Enhance how instructions are prepared for the model:

```typescript
// In assistantService.ts - sendMessage function

// Format instructions with task details
const prepareInstructions = (baseInstructions: string, task: Task | null): string => {
  let instructions = baseInstructions;
  
  if (task) {
    // Add concise task context to instructions
    const taskContext = formatTaskContext(task, TaskContextDetailLevel.MINIMAL);
    instructions += `\n\nThis conversation is about ${taskContext}. When the user asks questions about the task, provide complete and accurate information based on the task details. Always remember these details throughout the conversation.`;
    
    logTaskContext('instructions', conversationId, task.id, true, taskContext.length);
  }
  
  return instructions;
};
```

## Token Management Strategy

To ensure task context doesn't consume excessive tokens:

1. **Adaptive Detail Level**: Use `TaskContextDetailLevel.MINIMAL` for most message turns and `COMPREHENSIVE` only when necessary.
2. **Context Caching**: Don't repeat full task context in every message if it's already in the conversation history.
3. **Smart Truncation**: For long task descriptions, implement smart truncation that preserves meaning.
4. **Background Context**: Keep detailed task information in system messages, which are processed once and kept in context.

## Monitoring and Diagnostics

Add enhanced logging for troubleshooting:

1. **Context Presence Validation**: Log whether task context is included in each message.
2. **Token Usage Tracking**: Monitor how many tokens are dedicated to task context.
3. **Context Effectiveness Measure**: Track when the AI successfully references task details.

## Integration Test Cases

Design test cases to validate context integration:

1. Link a task and verify the system message is created.
2. Ask about task details and confirm the AI correctly responds.
3. Have a long conversation and then ask about the task to verify context retention.
4. Update a task during conversation and verify that changes are reflected.

## Conclusion

This enhanced design addresses the current limitations by standardizing formats, ensuring consistent presence across different integration points, managing token usage efficiently, and adding better diagnostics for troubleshooting context issues. By implementing these changes, the task context will be more reliably available to the AI throughout conversations, leading to more accurate and helpful responses regarding tasks.
