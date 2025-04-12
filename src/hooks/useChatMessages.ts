import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '@/api/messages';
import * as chatHistoryService from '@/services/chatHistoryService';
import { useToast } from '@/hooks/use-toast';
import { useAssistantConfig } from '@/hooks/useAssistantConfig';
import { useProjects } from '@/hooks/useProjects';
import { Message, Assistant, Task } from '@/utils/types';
import { createOpenAIStream } from '@/utils/openAIStream';
import { createDeepSeekStream } from '@/utils/deepSeekStream';
import { ModelType } from '@/hooks/useModelSelection';
import { flushSync } from 'react-dom';

class StreamingStateManager {
  private messageMap = new Map<string, string>();
  private listeners = new Set<(id: string, chunk: string, fullContent: string) => void>();

  constructor() {
    console.log('[StreamManager] Initialized');
  }

  addChunk(id: string, chunk: string): string {
    const current = this.messageMap.get(id) || '';
    const updated = current + chunk;
    this.messageMap.set(id, updated);
    
    console.log(`[${new Date().toISOString()}][StreamManager] Added chunk to message ${id}: "${chunk}" (${chunk.length} chars)`);
    
    this.listeners.forEach(listener => {
      console.log(`[${new Date().toISOString()}][StreamManager] Notifying listener about update to message ${id}`);
      listener(id, chunk, updated);
    });
    
    return updated;
  }
  
  getContent(id: string): string {
    return this.messageMap.get(id) || '';
  }
  
  subscribe(callback: (id: string, chunk: string, fullContent: string) => void) {
    this.listeners.add(callback);
    console.log(`[${new Date().toISOString()}][StreamManager] Added subscriber, total: ${this.listeners.size}`);
    
    return () => {
      this.listeners.delete(callback);
      console.log(`[${new Date().toISOString()}][StreamManager] Removed subscriber, total: ${this.listeners.size}`);
    };
  }
  
  clear(id: string) {
    this.messageMap.delete(id);
    console.log(`[${new Date().toISOString()}][StreamManager] Cleared message ${id}`);
  }
}

const streamingManager = new StreamingStateManager();

export function useChatMessages() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [activeAssistant, setActiveAssistantState] = useState<Assistant | null>(null);
  const [needsTitleGeneration, setNeedsTitleGeneration] = useState<string | null>(null);
  const [isTitleGenerating, setIsTitleGenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeProjectId } = useProjects();
  
  const { getAssistantConfig } = useAssistantConfig();
  
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  const { 
    data: messages = [],
    isLoading,
    error,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId ? messagesApi.getMessages(activeConversationId) : [],
    enabled: !!activeConversationId
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Setting up streaming subscription`);
    
    const unsubscribe = streamingManager.subscribe((id, chunk, fullContent) => {
      console.log(`[${new Date().toISOString()}] Stream update received for message ${id}, chunk length: ${chunk.length}`);
      
      try {
        flushSync(() => {
          setLocalMessages(currentMessages => {
            const updatedMessages = currentMessages.map(msg => {
              if (msg.id === id) {
                console.log(`[${new Date().toISOString()}] Updating message ${id} with content length: ${fullContent.length}`);
                return { ...msg, content: fullContent, isStreaming: true };
              }
              return msg;
            });
            
            return updatedMessages;
          });
        });
        console.log(`[${new Date().toISOString()}] flushSync completed for message ${id}`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error in flushSync:`, err);
      }
    });
    
    return unsubscribe;
  }, []);

  const startConversation = useCallback(async (title?: string) => {
    try {
      console.log(`Starting new conversation with title: ${title || 'New conversation'}`);
      const newConversation = await messagesApi.createConversation(title);
      console.log('Created conversation:', newConversation);
      
      if (activeProjectId) {
        try {
          await chatHistoryService.updateConversation(newConversation.id, { 
            project_id: activeProjectId 
          });
          console.log(`Associated conversation ${newConversation.id} with project ${activeProjectId}`);
        } catch (error) {
          console.error('Failed to associate conversation with project:', error);
        }
      } else {
        console.log(`Conversation ${newConversation.id} assigned to Open Chats group`);
      }
      
      if (!title || title === 'New conversation') {
        console.log(`Setting needsTitleGeneration for conversation: ${newConversation.id}`);
        setNeedsTitleGeneration(newConversation.id);
      }
      
      return newConversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast, activeProjectId]);

  const generateTitle = useCallback(async (conversationId: string) => {
    try {
      setIsTitleGenerating(true);
      console.log(`Starting title generation for conversation ${conversationId}`);
      
      const conversationMessages = await messagesApi.getMessages(conversationId);
      
      if (conversationMessages.length < 2) {
        console.log('Not enough messages to generate a title yet, need at least a user message and assistant response');
        setIsTitleGenerating(false);
        return;
      }
      
      const userMessage = conversationMessages.find(msg => msg.sender === 'user')?.content || '';
      const assistantMessage = conversationMessages.find(msg => msg.sender === 'assistant')?.content || '';
      
      if (!userMessage || !assistantMessage) {
        console.log('Missing user or assistant message for title generation, aborting');
        setIsTitleGenerating(false);
        return;
      }
      
      console.log('Found user and assistant messages for title generation:');
      console.log(`User message: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`);
      console.log(`Assistant message: ${assistantMessage.substring(0, 50)}${assistantMessage.length > 50 ? '...' : ''}`);
      
      const truncatedUserMsg = userMessage.length > 100 ? userMessage.substring(0, 100) + '...' : userMessage;
      const truncatedAssistantMsg = assistantMessage.length > 100 ? assistantMessage.substring(0, 100) + '...' : assistantMessage;
      
      const { assistantId } = getAssistantConfig();
      const modelType = assistantId.includes('deepseek') ? 'deepseek' : 'openai'; 
      
      console.log(`Using ${modelType} model for title generation`);
      
      const titlePrompt = `Based on this conversation, generate a short, concise title (3-5 words):
      
      User: ${truncatedUserMsg}
      
      Assistant: ${truncatedAssistantMsg}
      
      The title should be specific to the conversation topic, not generic. Don't use quotes in your response, just return the title text.`;
      
      let generatedTitle = 'Untitled Chat';
      
      if (modelType === 'openai') {
        try {
          let titleResponse = '';
          
          console.log('Sending OpenAI title generation request...');
          
          const updateTitle = async (finalResponse: string) => {
            generatedTitle = finalResponse.replace(/["']/g, '').trim();
            if (generatedTitle.endsWith('.')) {
              generatedTitle = generatedTitle.slice(0, -1);
            }
            
            console.log(`Generated title with OpenAI: "${generatedTitle}"`);
            
            const success = await updateConversationTitle(conversationId, generatedTitle);
            
            if (success) {
              console.log(`Successfully updated conversation ${conversationId} title to "${generatedTitle}"`);
            } else {
              console.error(`Failed to update conversation ${conversationId} title`);
              setTimeout(async () => {
                const retrySuccess = await updateConversationTitle(conversationId, generatedTitle);
                console.log(`Retry update ${retrySuccess ? 'succeeded' : 'failed'}`);
              }, 1000);
            }
          };
          
          const handleError = async (error: Error) => {
            console.error('Error generating title with OpenAI:', error);
            console.log('Falling back to default title due to error');
            const success = await updateConversationTitle(conversationId, 'Untitled Chat');
            if (!success) {
              console.error('Failed to set default title after error');
            }
          };
          
          await createOpenAIStream(
            {
              messages: [
                { role: 'system', content: 'You are a helpful assistant that generates very short, 3-5 word titles that summarize conversations.' },
                { role: 'user', content: titlePrompt }
              ]
            },
            {
              onStart: () => {
                console.log('Starting title generation with OpenAI');
              },
              onChunk: (chunk: string) => {
                titleResponse += chunk;
              },
              onComplete: async (finalResponse: string) => {
                await updateTitle(finalResponse);
              },
              onError: handleError
            }
          );
        } catch (error) {
          console.error('Failed to generate title with OpenAI:', error);
          console.log('Falling back to default title due to exception');
          await updateConversationTitle(conversationId, 'Untitled Chat');
        }
      } else {
        try {
          let titleResponse = '';
          
          console.log('Sending DeepSeek title generation request...');
          
          const updateTitle = async (finalResponse: string) => {
            generatedTitle = finalResponse.replace(/["']/g, '').trim();
            if (generatedTitle.endsWith('.')) {
              generatedTitle = generatedTitle.slice(0, -1);
            }
            
            console.log(`Generated title with DeepSeek: "${generatedTitle}"`);
            
            const success = await updateConversationTitle(conversationId, generatedTitle);
            
            if (success) {
              console.log(`Successfully updated conversation ${conversationId} title to "${generatedTitle}"`);
            } else {
              console.error(`Failed to update conversation ${conversationId} title`);
              setTimeout(async () => {
                const retrySuccess = await updateConversationTitle(conversationId, generatedTitle);
                console.log(`Retry update ${retrySuccess ? 'succeeded' : 'failed'}`);
              }, 1000);
            }
          };
          
          const handleError = async (error: Error) => {
            console.error('Error generating title with DeepSeek:', error);
            console.log('Falling back to default title due to error');
            const success = await updateConversationTitle(conversationId, 'Untitled Chat');
            if (!success) {
              console.error('Failed to set default title after error');
            }
          };
          
          await createDeepSeekStream(
            {
              messages: [
                { role: 'system', content: 'You are a helpful assistant that generates very short, 3-5 word titles that summarize conversations.' },
                { role: 'user', content: titlePrompt }
              ],
              model: 'deepseek-chat'
            },
            {
              onStart: () => {
                console.log('Starting title generation with DeepSeek');
              },
              onChunk: (chunk: string) => {
                titleResponse += chunk;
              },
              onComplete: async (finalResponse: string) => {
                await updateTitle(finalResponse);
              },
              onError: handleError
            }
          );
        } catch (error) {
          console.error('Failed to generate title with DeepSeek:', error);
          console.log('Falling back to default title due to exception');
          await updateConversationTitle(conversationId, 'Untitled Chat');
        }
      }
      
      setNeedsTitleGeneration(null);
      setIsTitleGenerating(false);
      
    } catch (error) {
      console.error('Error generating title:', error);
      setIsTitleGenerating(false);
      setNeedsTitleGeneration(null);
    }
  }, [getAssistantConfig]);

  const updateConversationTitle = useCallback(async (conversationId: string, title: string): Promise<boolean> => {
    try {
      console.log(`Updating conversation ${conversationId} with title: "${title}"`);
      
      console.log(`Making API call to update title for conversation: ${conversationId}`);
      console.time(`updateTitle-${conversationId}`);
      
      const success = await messagesApi.updateConversationTitle(conversationId, title);
      
      console.timeEnd(`updateTitle-${conversationId}`);
      
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        console.log(`Successfully updated conversation title in database: "${title}"`);
        return true;
      } else {
        console.error('Failed to update conversation title in database - API returned false');
        return false;
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }, [queryClient]);

  useEffect(() => {
    if (needsTitleGeneration && !isTitleGenerating && messages.length >= 2) {
      const hasUserMessage = messages.some(msg => msg.sender === 'user');
      const hasAssistantMessage = messages.some(msg => msg.sender === 'assistant');
      
      if (hasUserMessage && hasAssistantMessage) {
        console.log(`Triggering title generation for conversation: ${needsTitleGeneration}`);
        generateTitle(needsTitleGeneration);
      } else {
        console.log('Not enough message types to generate title yet, waiting for both user and assistant messages');
      }
    }
  }, [needsTitleGeneration, isTitleGenerating, messages, generateTitle]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sender, conversationId }: { content: string; sender: 'user' | 'assistant' | 'system'; conversationId: string }) => {
      return messagesApi.sendMessage(conversationId, content, sender);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const clearMessagesMutation = useMutation({
    mutationFn: async (conversationId: string | null) => {
      if (!conversationId) return false;
      return messagesApi.deleteConversationMessages(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    },
    onError: (error) => {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear messages. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const addMessage = useCallback((content: string, sender: 'user' | 'assistant' | 'system') => {
    if (!activeConversationId) return null;
    return sendMessageMutation.mutateAsync({ 
      content, 
      sender, 
      conversationId: activeConversationId 
    });
  }, [activeConversationId, sendMessageMutation]);

  const setActiveAssistant = useCallback(async (assistant: Assistant) => {
    setActiveAssistantState(assistant);
    return assistant;
  }, []);

  const linkTaskToConversation = useCallback(async (task: Task | null) => {
    setLinkedTask(task);
    return task;
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    sender: 'user' | 'assistant' | 'system' = 'user', 
    conversationId?: string | null,
    modelType: ModelType = 'openai'
  ) => {
    const convId = conversationId || activeConversationId;
    if (!content.trim() || !convId) return;

    try {
      console.log(`[${new Date().toISOString()}] Sending ${sender} message to conversation ${convId} using model: ${modelType}`);
      
      await sendMessageMutation.mutateAsync({ content, sender, conversationId: convId });
      
      if (sender === 'user') {
        setIsStreaming(true);
        
        const { assistantId, onStartStreaming, onToken, onComplete, onError } = getAssistantConfig();
        
        try {
          const tempMessageId = crypto.randomUUID();
          console.log(`[${new Date().toISOString()}] Created temporary message ID: ${tempMessageId} for streaming`);
          
          flushSync(() => {
            setLocalMessages(current => [
              ...current, 
              { 
                id: tempMessageId, 
                sender: 'assistant', 
                content: '', 
                conversation_id: convId,
                user_id: 'system',
                timestamp: new Date().toISOString(),
                isStreaming: true
              } as Message
            ]);
          });
          
          console.log(`[${new Date().toISOString()}] Added empty assistant message with ID: ${tempMessageId}`);
          
          if (onStartStreaming) {
            onStartStreaming(tempMessageId);
          }
          
          let streamedContent = '';
          
          const messagesForContext = await messagesApi.getMessages(convId);
          
          const messageHistory = messagesForContext.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          if (activeAssistant) {
            messageHistory.unshift({
              role: 'system',
              content: `You are ${activeAssistant.name || 'an AI assistant'}. ${activeAssistant.description || ''}`
            });
          } else {
            messageHistory.unshift({
              role: 'system',
              content: modelType === 'openai' 
                ? 'You are ActionAlpha, an engineering assistant designed to help with coding tasks and technical problems powered by OpenAI.'
                : 'You are ActionOmega, an engineering assistant designed to help with coding tasks and technical problems powered by DeepSeek.'
            });
          }
          
          if (modelType === 'openai') {
            console.log(`[${new Date().toISOString()}] Starting OpenAI stream with ${messageHistory.length} messages in history`);
            
            await createOpenAIStream(
              { messages: messageHistory },
              {
                onStart: () => {
                  console.log(`[${new Date().toISOString()}] OpenAI stream started`);
                },
                onChunk: (chunk: string) => {
                  if (!chunk || typeof chunk !== 'string') return;
                  
                  console.log(`[${new Date().toISOString()}] Received chunk: "${chunk}" (${chunk.length} chars)`);
                  
                  streamedContent = streamingManager.addChunk(tempMessageId, chunk);
                  
                  if (onToken) {
                    onToken(tempMessageId, chunk, streamedContent);
                  }
                },
                onComplete: async (finalResponse: string) => {
                  console.log(`[${new Date().toISOString()}] Stream complete, total response length: ${finalResponse.length}`);
                  streamedContent = finalResponse;
                  
                  streamingManager.clear(tempMessageId);
                  
                  if (onComplete) {
                    onComplete(tempMessageId, streamedContent);
                  }
                  
                  flushSync(() => {
                    setLocalMessages(current => current.map(msg => 
                      msg.id === tempMessageId 
                        ? { ...msg, content: streamedContent, isStreaming: false }
                        : msg
                    ));
                  });
                  
                  await sendMessageMutation.mutateAsync({ 
                    content: streamedContent, 
                    sender: 'assistant', 
                    conversationId: convId 
                  });
                  
                  setIsStreaming(false);
                  queryClient.invalidateQueries({ queryKey: ['messages', convId] });
                  queryClient.invalidateQueries({ queryKey: ['conversations'] });

                  if (needsTitleGeneration === convId && !isTitleGenerating) {
                    console.log(`[${new Date().toISOString()}] Conversation needs title generation, triggering now after assistant response completion`);
                    setTimeout(() => generateTitle(convId), 500);
                  }
                },
                onError: (error) => {
                  console.error(`[${new Date().toISOString()}] Stream error:`, error);
                  
                  streamingManager.clear(tempMessageId);
                  
                  flushSync(() => {
                    setLocalMessages(current => current.map(msg => 
                      msg.id === tempMessageId 
                        ? { ...msg, content: "Error: Failed to generate response. Please try again.", isStreaming: false }
                        : msg
                    ));
                  });
                  
                  setIsStreaming(false);
                  
                  if (onError) {
                    onError(error);
                  }
                }
              }
            );
          } else {
            try {
              console.log(`[${new Date().toISOString()}] Starting DeepSeek stream with ${messageHistory.length} messages in history`);
              
              await createDeepSeekStream(
                { 
                  messages: messageHistory,
                  model: 'deepseek-chat'
                },
                {
                  onStart: () => {
                    console.log(`[${new Date().toISOString()}] DeepSeek stream started`);
                  },
                  onChunk: (chunk: string) => {
                    if (!chunk || typeof chunk !== 'string') return;
                    
                    console.log(`[${new Date().toISOString()}] Received DeepSeek chunk: "${chunk}" (${chunk.length} chars)`);
                    
                    streamedContent = streamingManager.addChunk(tempMessageId, chunk);
                    
                    if (onToken) {
                      onToken(tempMessageId, chunk, streamedContent);
                    }
                  },
                  onComplete: async (finalResponse: string) => {
                    console.log(`[${new Date().toISOString()}] DeepSeek stream complete, total response length: ${finalResponse.length}`);
                    streamedContent = finalResponse;
                    
                    streamingManager.clear(tempMessageId);
                    
                    if (onComplete) {
                      onComplete(tempMessageId, streamedContent);
                    }
                    
                    flushSync(() => {
                      setLocalMessages(current => current.map(msg => 
                        msg.id === tempMessageId 
                          ? { ...msg, content: streamedContent, isStreaming: false }
                          : msg
                      ));
                    });
                    
                    await sendMessageMutation.mutateAsync({ 
                      content: streamedContent, 
                      sender: 'assistant', 
                      conversationId: convId 
                    });
                    
                    setIsStreaming(false);
                    queryClient.invalidateQueries({ queryKey: ['messages', convId] });
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    
                    if (needsTitleGeneration === convId && !isTitleGenerating) {
                      console.log(`[${new Date().toISOString()}] Conversation needs title generation, triggering now after completion`);
                      generateTitle(convId);
                    }
                  },
                  onError: (error) => {
                    console.error(`[${new Date().toISOString()}] DeepSeek API error:`, error);
                    
                    streamingManager.clear(tempMessageId);
                    
                    flushSync(() => {
                      setLocalMessages(current => current.map(msg => 
                        msg.id === tempMessageId 
                          ? { ...msg, content: "Error: Failed to generate response from DeepSeek. Please try again or check API configuration.", isStreaming: false }
                          : msg
                      ));
                    });
                    
                    if (error.message.includes('API key') || error.message.includes('401')) {
                      toast({
                        title: 'DeepSeek API Key Error',
                        description: 'The DeepSeek API key is invalid or missing. Please add a valid API key in the settings.',
                        variant: 'destructive'
                      });
                    }
                    
                    setIsStreaming(false);
                    
                    if (onError) {
                      onError(error);
                    }
                  }
                }
              );
            } catch (deepseekError) {
              console.error(`[${new Date().toISOString()}] Failed to use DeepSeek:`, deepseekError);
              
              toast({
                title: 'DeepSeek Error',
                description: 'Failed to use DeepSeek API. Please check your configuration or try again later.',
                variant: 'destructive'
              });
              
              setIsStreaming(false);
            }
          }
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error in stream processing:`, error);
          
          setIsStreaming(false);
          
          if (onError) {
            onError(error as Error);
          } else {
            toast({
              title: 'Error',
              description: 'An error occurred while processing your request.',
              variant: 'destructive'
            });
          }
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error sending message:`, error);
      setIsStreaming(false);
      toast({
        title: 'Error',
        description: 'Failed to process message. Please try again.',
        variant: 'destructive'
      });
    }
  }, [activeConversationId, sendMessageMutation, queryClient, toast, getAssistantConfig, activeAssistant, generateTitle, isTitleGenerating, needsTitleGeneration]);

  const clearMessages = useCallback(async (conversationId: string | null = activeConversationId) => {
    if (!conversationId) return;
    
    try {
      await messagesApi.deleteConversationMessages(conversationId);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      
      toast({
        title: 'Success',
        description: 'Conversation messages cleared successfully.',
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to clear conversation messages.',
        variant: 'destructive'
      });
    }
  }, [activeConversationId, queryClient, toast]);

  return {
    messages: localMessages.length > 0 ? localMessages : messages,
    isLoading,
    error,
    refetchMessages,
    activeConversationId,
    setActiveConversationId,
    inputValue,
    setInputValue,
    sendMessage,
    clearMessages,
    isSending: sendMessageMutation.isPending,
    isStreaming,
    startConversation,
    addMessage,
    activeAssistant,
    setActiveAssistant,
    linkedTask,
    linkTaskToConversation,
    updateConversationTitle
  };
}
