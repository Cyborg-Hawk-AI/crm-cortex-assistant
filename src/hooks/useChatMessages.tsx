
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as messageApi from '@/api/messages';
import { Message, Task, Assistant } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { useAssistantConfig } from './useAssistantConfig';
import { useMessageOperations } from './useMessageOperations';
import { useConversationManagement } from './useConversationManagement';
import { useChatStreaming } from './useChatStreaming';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatTaskContext, TaskContextDetailLevel, shouldRefreshTaskContext } from '@/utils/taskContextFormatter';

export const useChatMessages = () => {
  const { toast } = useToast();
  const { assistantConfig } = useAssistantConfig();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);

  const {
    activeConversationId,
    setActiveConversationId,
    startConversation,
    generateConversationTitle
  } = useConversationManagement();

  const {
    localMessages,
    setLocalMessages,
    addLocalMessage,
    saveMessage,
    clearMessages
  } = useMessageOperations(activeConversationId);

  const {
    isStreaming,
    setIsStreaming,
    isSending,
    setIsSending,
    currentStreamingMessageId,
    handleChatStream
  } = useChatStreaming();

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

  const messages = () => {
    const result = [...dbMessages];
    const dbMessageIds = new Set(dbMessages.map(msg => msg.id));
    
    for (const localMsg of localMessages) {
      if (!dbMessageIds.has(localMsg.id)) {
        result.push(localMsg);
      }
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const handleSetActiveAssistant = async (assistant: Assistant) => {
    setActiveAssistant(assistant);
    
    if (activeConversationId) {
      try {
        await messageApi.switchAssistant(activeConversationId, assistant);
      } catch (error) {
        console.error('Error setting assistant:', error);
      }
    }
    
    return assistant;
  };

  const handleLinkTaskToConversation = async (task: Task | null) => {
    setLinkedTask(task);
    
    if (activeConversationId && task) {
      try {
        await messageApi.linkTaskToConversation(activeConversationId, task);
      } catch (error) {
        console.error('Error linking task:', error);
      }
    }
    
    return task;
  };

  const sendMessage = async (
    content: string,
    sender: 'user' | 'assistant' | 'system' = 'user',
    specificConversationId?: string | null
  ): Promise<Message | null> => {
    if (!content.trim() || (isStreaming && sender === 'user')) {
      if (isStreaming) {
        toast({
          title: "Please wait",
          description: "Please wait for the current response to finish"
        });
      }
      return null;
    }

    try {
      if (sender === 'user') {
        setIsSending(true);
        let conversationId = specificConversationId || activeConversationId;
        
        if (!conversationId) {
          conversationId = await startConversation(
            activeAssistant?.name ? `Conversation with ${activeAssistant.name}` : 'New conversation'
          );
          setActiveConversationId(conversationId);
        }

        const userMessageId = uuidv4();
        const userMessage = addLocalMessage({
          id: userMessageId,
          content,
          sender: 'user',
          timestamp: new Date(),
          isSystem: false,
          conversation_id: conversationId,
          user_id: 'current-user'
        });

        await saveMessage(content, 'user', userMessageId, conversationId);

        const assistantMessageId = uuidv4();
        currentStreamingMessageId.current = assistantMessageId;

        const assistantMessage = addLocalMessage({
          id: assistantMessageId,
          content: '',
          sender: 'assistant',
          timestamp: new Date(),
          isSystem: false,
          isStreaming: true,
          conversation_id: conversationId,
          user_id: 'current-user'
        });

        let fullResponse = '';
        const systemPrompt = activeAssistant?.name 
          ? `You are ${activeAssistant.name}. ${activeAssistant.description || ''}`
          : 'You are ActionBot, an engineering assistant designed to help with coding tasks and technical problems.';

        if (linkedTask) {
          const taskContext = formatTaskContext(linkedTask, TaskContextDetailLevel.COMPREHENSIVE);
          systemPrompt += `\n\n${taskContext}`;
        }

        const messageHistory = (await messageApi.getMessages(conversationId)).map(msg => ({
          role: msg.sender === 'user' ? 'user' : msg.sender === 'system' ? 'system' : 'assistant',
          content: msg.content
        }));

        await handleChatStream(
          messageHistory,
          systemPrompt,
          (chunk: string) => {
            fullResponse += chunk;
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: fullResponse } 
                  : msg
              )
            );
          },
          async (finalResponse: string) => {
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: finalResponse, isStreaming: false } 
                  : msg
              )
            );
            
            await saveMessage(finalResponse, 'assistant', assistantMessageId, conversationId);
            
            if (messageHistory.length <= 1) {
              await generateConversationTitle(conversationId, content, finalResponse);
            }
            
            setIsSending(false);
          },
          (error: Error) => {
            const errorMessage = `Error: ${error.message}`;
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: errorMessage, isStreaming: false } 
                  : msg
              )
            );
            
            saveMessage(errorMessage, 'assistant', assistantMessageId, conversationId);
            setIsSending(false);
            
            toast({
              title: 'Error',
              description: `Failed to get response: ${error.message}`,
              variant: 'destructive'
            });
          }
        );

        return userMessage;
      } else {
        const messageId = uuidv4();
        let conversationId = specificConversationId || activeConversationId;
        
        if (!conversationId) {
          conversationId = await startConversation();
          setActiveConversationId(conversationId);
        }

        const message = addLocalMessage({
          id: messageId,
          content,
          sender,
          timestamp: new Date(),
          isSystem: sender === 'system',
          conversation_id: conversationId,
          user_id: 'current-user'
        });

        await saveMessage(content, sender, messageId, conversationId);
        return message;
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      setIsSending(false);
      setIsStreaming(false);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
      
      return null;
    }
  };

  const linkMissionToConversation = async (mission: Task | null) => {
    if (mission) {
      setLinkedTask(mission);
    } else {
      setLinkedTask(null);
    }
    
    if (activeConversationId && mission) {
      try {
        await supabase
          .from('conversations')
          .update({ task_id: mission.id })
          .eq('id', activeConversationId);
        
        const taskMessage = `Task linked: ${mission.title} (Status: ${mission.status}, Priority: ${mission.priority})
Description: ${mission.description || 'No description provided'}
Due date: ${mission.due_date ? new Date(mission.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(mission.updated_at).toLocaleString()}`;
        
        await saveMessage(taskMessage, 'system', uuidv4(), activeConversationId);
        refetchMessages();
      } catch (error) {
        console.error('Error linking mission:', error);
        throw error;
      }
    }
    
    return mission;
  };

  return {
    messages: messages(),
    inputValue,
    setInputValue,
    sendMessage,
    addMessage: (content: string, sender: 'user' | 'assistant' | 'system') => {
      return addLocalMessage({
        id: uuidv4(),
        content,
        sender,
        timestamp: new Date(),
        isSystem: sender === 'system',
        conversation_id: activeConversationId || 'temp-conversation',
        user_id: 'current-user'
      });
    },
    activeAssistant,
    setActiveAssistant: handleSetActiveAssistant,
    clearMessages,
    isLoading: isLoadingMessages || isLoadingConversations,
    isSending,
    isStreaming,
    linkedTask,
    linkTaskToConversation: handleLinkTaskToConversation,
    linkMissionToConversation,
    activeConversationId,
    startConversation,
    setActiveConversationId,
    refetchMessages,
    saveMessage,
    generateConversationTitle,
    refetchConversations
  };
};

export type { ChatMessagesHook } from './useChatMessages';
