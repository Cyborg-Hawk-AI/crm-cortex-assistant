
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
    console.log(`[${new Date().toISOString()}][AssistantConfig] Token received for ${messageId}: "${token.substring(0, 10)}${token.length > 10 ? '...' : ''}" (${token.length} chars)`);
    
    try {
      // Force synchronous update to ensure each token is visible immediately
      flushSync(() => {
        setTempMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(messageId, fullContent);
          return newMap;
        });
      });
      
      // The setTempMessages update should happen synchronously due to flushSync
      console.log(`[${new Date().toISOString()}][AssistantConfig] Updated temp message ${messageId}, content length: ${fullContent.length}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}][AssistantConfig] Error in token handler:`, error);
    }
  }, []);
  
  const handleStartStreaming = useCallback((messageId: string) => {
    console.log(`[${new Date().toISOString()}][AssistantConfig] Started streaming for message ${messageId}`);
    
    // Initialize with empty content
    setTempMessages(prev => {
      const newMap = new Map(prev);
      newMap.set(messageId, '');
      return newMap;
    });
  }, []);
  
  const handleComplete = useCallback((messageId: string, content: string) => {
    console.log(`[${new Date().toISOString()}][AssistantConfig] Completed streaming for message ${messageId}, final length: ${content.length}`);
    
    // Remove from temp messages when complete
    setTempMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });
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
  };
}
