
import { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { ASSISTANTS, getAssistantConfigById } from '@/utils/assistantConfig';
import { Assistant } from '@/utils/types';

export function useAssistantConfig() {
  // Track current assistant configuration
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);
  
  // Callbacks for streaming events
  const [onStartStreaming, setOnStartStreaming] = useState<((messageId: string) => void) | null>(null);
  const [onToken, setOnToken] = useState<((messageId: string, token: string, fullContent: string) => void) | null>(null);
  const [onComplete, setOnComplete] = useState<((messageId: string, fullContent: string) => void) | null>(null);
  const [onError, setOnError] = useState<((error: Error) => void) | null>(null);
  
  // Get assistant configuration based on current assistant ID
  const getAssistantConfig = useCallback(() => {
    const config = getAssistantConfigById(currentAssistantId);
    
    // Wrap the token callback with flushSync to ensure immediate UI updates
    const wrappedOnToken = onToken 
      ? (messageId: string, token: string, fullContent: string) => {
          try {
            // Use flushSync to force immediate UI update for each token
            flushSync(() => {
              onToken(messageId, token, fullContent);
            });
          } catch (error) {
            console.error('Error in token streaming callback:', error);
            // Fall back to regular update if flushSync fails
            onToken(messageId, token, fullContent);
          }
        }
      : undefined;
    
    return {
      assistantId: currentAssistantId || ASSISTANTS.DEFAULT.id,
      prompt: config.prompt,
      contextPrompt: config.contextPrompt,
      name: config.name,
      onStartStreaming: onStartStreaming || undefined,
      onToken: wrappedOnToken,
      onComplete: onComplete || undefined,
      onError: onError || undefined
    };
  }, [currentAssistantId, onStartStreaming, onToken, onComplete, onError]);
  
  // Update the streaming callbacks
  const setStreamingCallbacks = useCallback(({
    onStart,
    onTokenReceived,
    onCompleted,
    onErrorOccurred
  }: {
    onStart?: (messageId: string) => void;
    onTokenReceived?: (messageId: string, token: string, fullContent: string) => void;
    onCompleted?: (messageId: string, fullContent: string) => void;
    onErrorOccurred?: (error: Error) => void;
  }) => {
    if (onStart) setOnStartStreaming(() => onStart);
    if (onTokenReceived) setOnToken(() => onTokenReceived);
    if (onCompleted) setOnComplete(() => onCompleted);
    if (onErrorOccurred) setOnError(() => onErrorOccurred);
  }, []);
  
  return {
    currentAssistantId,
    setCurrentAssistantId,
    getAssistantConfig,
    setStreamingCallbacks
  };
}
