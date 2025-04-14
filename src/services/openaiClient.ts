import { getCurrentUserEmail, supabase } from '@/lib/supabase';
import { StreamingCallbacks } from '@/utils/streamTypes';

const decoder = new TextDecoder('utf-8');
// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';
const HARDCODED_API_KEY = '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';
// Using a different assistant ID as the previous one wasn't found
const DEFAULT_ASSISTANT_ID = 'asst_koI8HIazZW995Gtva0Vrxsdj';

// Helper function to get OpenAI API key from app_configuration
export const getOpenAIApiKey = async (): Promise<string> => {
  // Return the hardcoded API key for now as requested by the user
  return HARDCODED_API_KEY;
};

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Helper function to get OpenAI headers
const getOpenAIHeaders = async (apiKeyOverride?: string): Promise<HeadersInit> => {
  const apiKey = apiKeyOverride || await getOpenAIApiKey();
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2'  // Updated to v2 from v1
  };
};

// Ensure default assistant exists and return its ID
export const ensureDefaultAssistantExists = async (): Promise<string> => {
  const apiKey = await getOpenAIApiKey();
  
  return DEFAULT_ASSISTANT_ID;
};

// Create a new OpenAI thread
export const createThread = async (apiKeyOverride?: string): Promise<string | null> => {
  try {
    const response = await fetch(`${OPENAI_API_URL}/threads`, {
      method: 'POST',
      headers: await getOpenAIHeaders(apiKeyOverride),
      body: JSON.stringify({})
    });

    if (!response.ok) {
      console.error('Failed to create thread:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating OpenAI thread:', error);
    return null;
  }
};

// Get thread messages for debugging purposes
export const getThreadMessages = async (
  threadId: string, 
  apiKeyOverride?: string,
  limit = 20
): Promise<any[]> => {
  try {
    const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages?limit=${limit}`, {
      method: 'GET',
      headers: await getOpenAIHeaders(apiKeyOverride)
    });

    if (!response.ok) {
      console.error('Failed to get thread messages:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error getting thread messages:', error);
    return [];
  }
};

// Clear thread messages - helper for refreshing thread with new history
export const clearThreadMessages = async (
  threadId: string,
  apiKeyOverride?: string
): Promise<boolean> => {
  try {
    // Get existing messages
    const messages = await getThreadMessages(threadId, apiKeyOverride, 100);
    console.log(`Found ${messages.length} messages in thread to clear`);
    
    // Delete each message (in a real implementation, we might use a batch delete if available)
    for (const message of messages) {
      const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages/${message.id}`, {
        method: 'DELETE',
        headers: await getOpenAIHeaders(apiKeyOverride)
      });
      
      if (!response.ok) {
        console.error('Failed to delete message:', await response.text());
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing thread messages:', error);
    return false;
  }
};

// Add messages to an OpenAI thread with history
export const addMessagesToThread = async (
  threadId: string,
  messages: { role: string, content: string }[],
  apiKeyOverride?: string
): Promise<boolean> => {
  try {
    // Add each message to the thread in order
    console.log(`Adding ${messages.length} messages to thread ${threadId}`);
    
    for (const message of messages) {
      // Skip empty messages
      if (!message.content || message.content.trim() === '') {
        console.warn('Skipping empty message');
        continue;
      }
      
      const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages`, {
        method: 'POST',
        headers: await getOpenAIHeaders(apiKeyOverride),
        body: JSON.stringify({
          role: message.role,
          content: message.content
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add message to thread:', errorText);
        // Continue attempting to add other messages
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error adding messages to OpenAI thread:', error);
    return false;
  }
};

// Add a message to an OpenAI thread
export const addMessageToThread = async (
  threadId: string, 
  content: string | { role: string, content: string }, 
  apiKeyOverride?: string,
  role: 'user' | 'assistant' = 'user'
): Promise<string | null> => {
  try {
    // Handle both string content and object content
    let messageRole = role;
    let messageContent = '';
    
    if (typeof content === 'string') {
      messageContent = content;
    } else {
      messageRole = content.role as 'user' | 'assistant';
      messageContent = content.content;
    }
    
    // Skip empty messages
    if (!messageContent || messageContent.trim() === '') {
      console.warn('Skipping empty message');
      return null;
    }
    
    const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/messages`, {
      method: 'POST',
      headers: await getOpenAIHeaders(apiKeyOverride),
      body: JSON.stringify({
        role: messageRole,
        content: messageContent
      })
    });

    if (!response.ok) {
      console.error('Failed to add message to thread:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error adding message to OpenAI thread:', error);
    return null;
  }
};

// Run an assistant on a thread
export const runAssistant = async (
  threadId: string, 
  assistantId: string | null = DEFAULT_ASSISTANT_ID, 
  apiKeyOverride?: string,
  instructions?: string
): Promise<string | null> => {
  try {
    // First, ensure we have a valid assistant ID
    const finalAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    
    if (!finalAssistantId) {
      throw new Error('No assistant ID available and could not create a new one');
    }
    
    const payload: any = {
      assistant_id: finalAssistantId
    };
    
    if (instructions) {
      payload.instructions = instructions;
    }
    
    const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: await getOpenAIHeaders(apiKeyOverride),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to run assistant:', errorText);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error running OpenAI assistant:', error);
    return null;
  }
};

// Get the status of a run
export const getRunStatus = async (
  threadId: string, 
  runId: string, 
  apiKeyOverride?: string
): Promise<any> => {
  try {
    const response = await fetch(`${OPENAI_API_URL}/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: await getOpenAIHeaders(apiKeyOverride)
    });

    if (!response.ok) {
      console.error('Failed to get run status:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting run status:', error);
    return null;
  }
};

// Stream the assistant's response in real-time with polling and streaming
export const streamRunResponse = async (
  threadId: string,
  runId: string,
  callbacks: StreamingCallbacks,
  apiKeyOverride?: string
) => {
  try {
    // Call onStart callback to indicate streaming has begun
    callbacks.onStart();
    
    // Keep track of content we've seen so far to detect changes
    let seenContent = '';
    let isStreamComplete = false;
    let messageText = '';
    let pollingInterval = 1000; // Start with 1 second polling
    let retryCount = 0;
    const maxRetries = 30; // Maximum number of retries before giving up
    
    const checkRunCompletion = async () => {
      try {
        if (retryCount >= maxRetries) {
          callbacks.onError(new Error('Maximum retries exceeded while waiting for run completion'));
          return;
        }
        
        const runStatus = await getRunStatus(threadId, runId, apiKeyOverride);
        
        if (!runStatus) {
          retryCount++;
          setTimeout(checkRunCompletion, pollingInterval);
          return;
        }
        
        console.log(`Run status: ${runStatus.status}`);
        
        if (runStatus.status === 'completed') {
          console.log('Run completed, getting final message');
          const messages = await getThreadMessages(threadId, apiKeyOverride, 1);
          
          if (messages && messages.length > 0) {
            // Get the latest assistant message
            const assistantMessage = messages.find(m => m.role === 'assistant');
            if (assistantMessage) {
              let content = '';
              
              // Handle different content structures
              if (assistantMessage.content && Array.isArray(assistantMessage.content)) {
                // New format where content is an array of content blocks
                for (const contentBlock of assistantMessage.content) {
                  if (contentBlock.type === 'text') {
                    content += contentBlock.text?.value || '';
                  }
                }
              } else if (assistantMessage.content?.[0]?.text?.value) {
                // Alternative format
                content = assistantMessage.content[0].text.value;
              } else {
                // Fallback for other formats
                content = JSON.stringify(assistantMessage.content) || '';
              }
              
              // Only send the new content we haven't seen yet
              if (content !== seenContent) {
                callbacks.onChunk(content);
                seenContent = content;
                messageText = content;
              }
            }
          }
          
          // Mark streaming as complete and ensure we call the complete callback
          isStreamComplete = true;
          
          // Make sure we have content before calling complete
          if (messageText && messageText.trim()) {
            callbacks.onComplete(messageText);
          } else {
            // If somehow we don't have content, provide a fallback
            callbacks.onComplete("I processed your request but couldn't generate a response. Please try again.");
          }
        } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          const errorMsg = runStatus.last_error?.message || 'Unknown error';
          console.error(`Run ${runStatus.status}: ${errorMsg}`);
          callbacks.onError(new Error(`Run ${runStatus.status}: ${errorMsg}`));
        } else {
          // Status is still in_progress, queued, etc.
          // Check for partial messages while the run is in progress
          if (runStatus.status === 'in_progress') {
            const messages = await getThreadMessages(threadId, apiKeyOverride, 1);
            
            if (messages && messages.length > 0) {
              // Find the latest assistant message
              const assistantMessage = messages.find(m => m.role === 'assistant');
              if (assistantMessage) {
                let content = '';
                
                // Handle different content structures
                if (assistantMessage.content && Array.isArray(assistantMessage.content)) {
                  // New format where content is an array of content blocks
                  for (const contentBlock of assistantMessage.content) {
                    if (contentBlock.type === 'text') {
                      content += contentBlock.text?.value || '';
                    }
                  }
                } else if (assistantMessage.content?.[0]?.text?.value) {
                  // Alternative format
                  content = assistantMessage.content[0].text.value;
                } else {
                  // Fallback for other formats
                  content = JSON.stringify(assistantMessage.content) || '';
                }
                
                // Only send new content
                if (content !== seenContent && content.length > 0) {
                  console.log("Streaming new content chunk:", content.slice(0, 20) + "...");
                  callbacks.onChunk(content);
                  seenContent = content;
                  messageText = content;
                }
              }
            }
            
            // Adjust polling interval based on activity
            pollingInterval = 750; // Faster polling when active
          } else {
            // Slower polling when queued or requiring action
            pollingInterval = 1500;
          }
          
          // Continue polling
          setTimeout(checkRunCompletion, pollingInterval);
        }
      } catch (error) {
        console.error("Error in checkRunCompletion:", error);
        retryCount++;
        setTimeout(checkRunCompletion, pollingInterval * 2); // Exponential back-off
      }
    };
    
    // Start checking run status
    checkRunCompletion();
    
    // Return a function that can be used to check if streaming is complete
    return () => isStreamComplete;
  } catch (error) {
    callbacks.onError(error);
    return () => true; // Return a function that indicates streaming is complete due to error
  }
};

// Create an assistant
export const createAssistant = async (
  name: string = "General Assistant",
  instructions: string = "You are a helpful AI assistant that helps users with their tasks.",
  model = 'gpt-4o',
  apiKeyOverride?: string
): Promise<string | null> => {
  try {
    console.log('Creating new assistant with model:', model);
    const response = await fetch(`${OPENAI_API_URL}/assistants`, {
      method: 'POST',
      headers: await getOpenAIHeaders(apiKeyOverride),
      body: JSON.stringify({
        name,
        instructions,
        model
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create assistant:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Assistant created successfully with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating OpenAI assistant:', error);
    return null;
  }
};

// Retrieve all assistants to check if we have any
export const listAssistants = async (apiKeyOverride?: string): Promise<any[]> => {
  try {
    const response = await fetch(`${OPENAI_API_URL}/assistants?limit=100`, {
      method: 'GET',
      headers: await getOpenAIHeaders(apiKeyOverride)
    });

    if (!response.ok) {
      console.error('Failed to list assistants:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error listing OpenAI assistants:', error);
    return [];
  }
};

// Stream OpenAI assistant response with delta support
export const streamAssistantResponse = async ({
  threadId,
  assistantId,
  apiKey,
  instructions,
  onStart,
  onDelta,
  onDone
}: {
  threadId: string;
  assistantId: string;
  apiKey: string;
  instructions?: string;
  onStart?: (runId: string) => void;
  onDelta?: (chunk: string) => void;
  onDone?: () => void;
}): Promise<void> => {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      instructions,
      stream: true
    })
  });

  if (!response.ok || !response.body) {
    console.error('Streaming failed to start:', await response.text());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let runId: string | null = null;

  onStart?.(runId);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    for (const line of text.split('\n')) {
      if (!line.trim().startsWith('data:')) continue;
      const cleaned = line.replace(/^data:\s*/, '').trim();
      if (cleaned === '[DONE]') break;

      try {
        const json = JSON.parse(cleaned);
        const delta = json?.delta?.content;
        if (delta) {
          accumulated += delta;
          onDelta?.(delta);
        }
      } catch (err) {
        console.warn('Failed to parse stream chunk:', line, err);
      }
    }
  }

  onDone?.();
};
