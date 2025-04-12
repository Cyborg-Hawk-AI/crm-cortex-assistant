
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/utils/types';
import { flushSync } from 'react-dom';

export function useAssistantConfig() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tempMessages, setTempMessages] = useState<Map<string, string>>(new Map());
  
  // Callback for streaming updates
  const handleToken = useCallback((messageId: string, token: string, fullContent: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][AssistantConfig] Token received for ${messageId}: "${token.substring(0, 10)}${token.length > 10 ? '...' : ''}" (${token.length} chars)`);
    
    try {
      console.log(`[${timestamp}][AssistantConfig] Before flushSync update for message ${messageId}`);
      
      // Force synchronous update to ensure each token is visible immediately
      flushSync(() => {
        setTempMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(messageId, fullContent);
          return newMap;
        });
      });
      
      // The setTempMessages update should happen synchronously due to flushSync
      console.log(`[${timestamp}][AssistantConfig] After flushSync - updated temp message ${messageId}, content length: ${fullContent.length}`);
    } catch (error) {
      console.error(`[${timestamp}][AssistantConfig] Error in token handler:`, error);
    }
  }, []);
  
  const handleStartStreaming = useCallback((messageId: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][AssistantConfig] Started streaming for message ${messageId}`);
    
    try {
      // Initialize with empty content and force immediate update
      flushSync(() => {
        setTempMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(messageId, '');
          return newMap;
        });
      });
      console.log(`[${timestamp}][AssistantConfig] Initialized streaming message ${messageId} with empty content`);
    } catch (error) {
      console.error(`[${timestamp}][AssistantConfig] Error initializing streaming:`, error);
    }
  }, []);
  
  const handleComplete = useCallback((messageId: string, content: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][AssistantConfig] Completed streaming for message ${messageId}, final length: ${content.length}`);
    
    try {
      // Remove from temp messages when complete with immediate update
      flushSync(() => {
        setTempMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
      });
      console.log(`[${timestamp}][AssistantConfig] Removed message ${messageId} from temporary messages`);
    } catch (error) {
      console.error(`[${timestamp}][AssistantConfig] Error completing streaming:`, error);
    }
  }, []);
  
  const handleError = useCallback((error: Error) => {
    console.error(`[${new Date().toISOString()}][AssistantConfig] Error in streaming:`, error);
    
    toast({
      title: 'Error',
      description: 'An error occurred while generating the response.',
      variant: 'destructive'
    });
  }, [toast]);

  const getAssistantConfig = useCallback(() => {
    return {
      assistantId: 'openai-gpt4',
      onStartStreaming: handleStartStreaming,
      onToken: handleToken,
      onComplete: handleComplete,
      onError: handleError,
    };
  }, [handleStartStreaming, handleToken, handleComplete, handleError]);

  return {
    getAssistantConfig,
    messages,
    setMessages,
    tempMessages, // Expose temp messages for direct access
  };
}
