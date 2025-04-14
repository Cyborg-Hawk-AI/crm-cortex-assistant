import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messageApi from '@/api/messages';
import { Message, Task, Assistant, ModelOption } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { useAssistantConfig } from './useAssistantConfig';
import { openAIChat } from '@/utils/openAIStream';
import { deepSeekChat } from '@/utils/deepSeekStream';
import { useModelSelection } from './useModelSelection';
import { useAuth } from '@/contexts/AuthContext';
import * as messageService from '@/services/chatHistoryService';

export const useChatMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { assistantConfig } = useAssistantConfig();
  const { modelOption, modelSelection } = useModelSelection();
  const { user } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [openAiThreadId, setOpenAiThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isInitialLoadDone = useRef(false);

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const pendingMessages = useRef<Set<string>>(new Set());
  const currentStreamingMessageId = useRef<string | null>(null);
  const processingMessageQueue = useRef<Set<string>>(new Set());

  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations(),
  });

  const {
    data: dbMessages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId 
      ? messageApi.getMessages(activeConversationId) 
      : Promise.resolve([]),
    enabled: !!activeConversationId,
  });

  useEffect(() => {
    if (activeConversationId) {
      console.log(`Loading messages for conversation: ${activeConversationId}`);
      refetchMessages();
      
      setLocalMessages([]);
      
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      if (activeConversation) {
        setOpenAiThreadId(activeConversation.open_ai_thread_id || null);
        
        if (activeConversation.assistant_id) {
          const assistantConfig = { 
            id: activeConversation.assistant_id, 
            name: "AI Assistant",
            description: "Default AI Assistant",
            capabilities: []
          };
          setActiveAssistant(assistantConfig);
        }
        
        console.log(`Switched to conversation: ${activeConversationId} with thread: ${activeConversation.open_ai_thread_id || 'none'}`);
      }
    }
  }, [activeConversationId, conversations, refetchMessages]);

  const messages = useCallback(() => {
    const result = [...dbMessages];
    
    const dbMessageIds = new Set(dbMessages.map(msg => msg.id));
    
    for (const localMsg of localMessages) {
      if (!dbMessageIds.has(localMsg.id)) {
        result.push(localMsg);
      }
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [dbMessages, localMessages]);

  const startConversation = async (title?: string, projectId: string = ''): Promise<string> => {
    try {
      const conversationTitle = title?.trim() || 'New conversation';
      const conversation = await messageApi.createConversation(conversationTitle, projectId || undefined);
      
      console.log(`Auto-activating new conversation: ${conversation.id}`);
      setActiveConversationId(conversation.id);
      setLocalMessages([]);
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      refetchConversations();
      
      console.log(`Created conversation ${conversation.id} with title "${conversationTitle}" in Open Chats group`);
      
      return conversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const switchAssistant = async (assistant: Assistant): Promise<boolean> => {
    try {
      if (!activeConversationId) {
        console.error("No active conversation to switch assistant for");
        return false;
      }

      console.log(`Switching assistant for conversation ${activeConversationId} to ${assistant.id} (${assistant.name})`);
      
      const success = await messageApi.switchAssistant(activeConversationId, assistant);
      
      if (success) {
        setActiveAssistant(assistant);
        
        const systemMessage = `Switched to ${assistant.name} assistant`;
        await saveMessage(systemMessage, 'system', uuidv4(), activeConversationId);
        
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
        
        console.log(`Successfully switched assistant to ${assistant.name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error switching assistant:', error);
      return false;
    }
  };

  const addMessage = (content: string, sender: 'user' | 'assistant' | 'system'): Message => {
    const message: Message = {
      id: uuidv4(),
      content,
      sender,
      timestamp: new Date(),
      isSystem: sender === 'system'
    };
    
    setLocalMessages(prev => [...prev, message]);
    return message;
  };

  const saveMessage = async (content: string, sender: 'user' | 'assistant' | 'system', messageId?: string, specificConversationId?: string): Promise<Message | null> => {
    try {
      const conversationId = specificConversationId || activeConversationId;
      
      if (!conversationId) {
        console.error('No conversation ID available to save message.');
        return null;
      }
      
      console.log(`Saving ${sender} message to conversation ${conversationId}`);
      
      const savedMessage = await messageApi.sendMessage(
        conversationId,
        content,
        sender,
        messageId
      );
      
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      
      if (sender === 'user' || sender === 'assistant') {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
      
      return savedMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: 'Error saving message',
        description: 'The message may not be saved properly.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const sendMessage = async (content: string, sender: 'user' | 'assistant' | 'system' = 'user', specificConversationId?: string | null): Promise<Message | null> => {
    if (isStreaming || isSending) {
      console.warn('Already streaming or sending a message, ignoring request');
      toast({
        title: 'Please wait',
        description: 'A response is being generated. Please wait before sending another message.',
      });
      return null;
    }
    
    const trimmedContent = content.trim();
    if (!trimmedContent && sender !== 'system') {
      console.warn('Empty message, ignoring');
      return null;
    }
    
    setIsSending(true);
    
    try {
      let conversationId = specificConversationId || activeConversationId;
      
      if (!conversationId) {
        console.log('No active conversation, creating new one before sending message');
        conversationId = await startConversation();
      }
      
      const userMessage = await saveMessage(trimmedContent, sender, undefined, conversationId);
      
      if (sender !== 'system') {
        if (!userMessage) {
          console.error('Failed to save user message');
          return null;
        }
        
        const existingMessages = messages();
        console.log(`Sending ${existingMessages.length} messages for context to maintain conversation history`);
        
        const assistantMessageId = uuidv4();
        const assistantMessage = addMessage("", "assistant");
        assistantMessage.id = assistantMessageId;
        
        setIsStreaming(true);
        currentStreamingMessageId.current = assistantMessageId;
        
        console.log('Starting to stream assistant response');
        
        let fullResponse = '';
        
        if (modelOption === 'deepseek') {
          await deepSeekChat(
            {
              messages: existingMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              systemPrompt: assistantConfig.prompt,
            },
            {
              onStart: () => {
                console.log('Stream started');
              },
              onChunk: (chunk: string) => {
                fullResponse += chunk;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse } 
                      : msg
                  )
                );
              },
              onComplete: async (finalResponse: string) => {
                console.log('Stream complete');
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                
                if (fullResponse !== finalResponse) {
                  fullResponse = finalResponse;
                  setLocalMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullResponse } 
                        : msg
                    )
                  );
                }
                
                console.log('Stream completed, saving final response');
                await saveMessage(fullResponse, 'assistant', assistantMessageId, conversationId);
                
                const convo = conversations.find(c => c.id === conversationId);
                if (convo && convo.title === 'New conversation' && !specificConversationId) {
                  console.log('First exchange, generating conversation title');
                  await generateConversationTitle(conversationId, trimmedContent, fullResponse);
                }
              },
              onError: (error: Error) => {
                console.error('Error in streaming response:', error);
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                toast({
                  title: 'Error generating response',
                  description: 'Please try again.',
                  variant: 'destructive'
                });
              }
            }
          );
        } else {
          await openAIChat(
            {
              messages: existingMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              systemPrompt: assistantConfig.prompt,
            },
            {
              onStart: () => {
                console.log('Stream started');
              },
              onChunk: (chunk: string) => {
                fullResponse += chunk;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse } 
                      : msg
                  )
                );
              },
              onComplete: async (finalResponse: string) => {
                console.log('Stream complete');
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                
                if (fullResponse !== finalResponse) {
                  fullResponse = finalResponse;
                  setLocalMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullResponse } 
                        : msg
                    )
                  );
                }
                
                console.log('Stream completed, saving final response');
                await saveMessage(fullResponse, 'assistant', assistantMessageId, conversationId);
                
                const convo = conversations.find(c => c.id === conversationId);
                if (convo && convo.title === 'New conversation' && !specificConversationId) {
                  console.log('First exchange, generating conversation title');
                  await generateConversationTitle(conversationId, trimmedContent, fullResponse);
                }
              },
              onError: (error: Error) => {
                console.error('Error in streaming response:', error);
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                toast({
                  title: 'Error generating response',
                  description: 'Please try again.',
                  variant: 'destructive'
                });
              }
            }
          );
        }
        
        return userMessage;
      } else {
        return userMessage;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const clearMessages = async (conversationId?: string) => {
    try {
      const targetConversationId = conversationId || activeConversationId;
      if (!targetConversationId) {
        console.error('No conversation ID to clear messages for');
        return;
      }
      
      await messageApi.deleteConversationMessages(targetConversationId);
      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: ['messages', targetConversationId] });
      
      await saveMessage('Conversation cleared', 'system', uuidv4(), targetConversationId);
      
      toast({
        title: 'Conversation cleared',
        description: 'All messages have been deleted.',
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear conversation',
        variant: 'destructive'
      });
    }
  };

  const linkTaskToConversation = async (task: Task | null): Promise<Task | null> => {
    try {
      if (!activeConversationId) {
        toast({
          title: 'No conversation selected',
          description: 'Please select a conversation first',
          variant: 'destructive'
        });
        return null;
      }
      
      setLinkedTask(task);
      
      if (task) {
        await messageApi.linkTaskToConversation(activeConversationId, task);
        
        await saveMessage(`Task linked: ${task.title}`, 'system', uuidv4(), activeConversationId);
        
        toast({
          title: 'Task linked',
          description: `Task "${task.title}" linked to this conversation`,
        });
      } else {
        await messageApi.linkTaskToConversation(activeConversationId, null);
        
        await saveMessage('Task unlinked', 'system', uuidv4(), activeConversationId);
        
        toast({
          title: 'Task unlinked',
          description: 'The task is no longer linked to this conversation',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      return task;
    } catch (error) {
      console.error('Error linking task to conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to link task to conversation',
        variant: 'destructive'
      });
      return null;
    }
  };

  const generateConversationTitle = async (
    conversationId: string, 
    userMessage: string, 
    assistantResponse: string
  ): Promise<void> => {
    try {
      const titleGenerationPrompt = `Generate a concise, descriptive title for this conversation based on the context. 
        User message: "${userMessage}"
        Assistant response: "${assistantResponse}"
        
        Title (3-5 words):`;

      const response = await openAIChat({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: titleGenerationPrompt }],
      });

      const generatedTitle = response.trim();
      
      await messageService.updateConversationTitle(conversationId, generatedTitle);
    } catch (error) {
      console.error('Error generating conversation title:', error);
    }
  };

  return {
    messages: messages(),
    isLoading: isLoadingMessages || isLoadingConversations,
    isSending,
    isStreaming,
    inputValue,
    setInputValue,
    sendMessage,
    addMessage,
    saveMessage,
    clearMessages,
    activeConversationId,
    setActiveConversationId,
    startConversation,
    activeAssistant,
    setActiveAssistant: switchAssistant,
    switchAssistant,
    linkedTask,
    linkTaskToConversation,
    refetchMessages,
    refetchConversations: () => refetchConversations(),
    generateConversationTitle,
  };
};
