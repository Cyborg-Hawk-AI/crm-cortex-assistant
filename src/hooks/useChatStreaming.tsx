
import { useState, useRef } from 'react';
import { useModelSelection } from './useModelSelection';
import { openAIChat } from '@/utils/openAIStream';
import { deepSeekChat } from '@/utils/deepSeekStream';
import { Message } from '@/utils/types';
import { formatTaskContext, TaskContextDetailLevel } from '@/utils/taskContextFormatter';

export const useChatStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const currentStreamingMessageId = useRef<string | null>(null);
  const { selectedModel, modelSelection } = useModelSelection();

  const handleChatStream = async (
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onChunkReceived: (chunk: string) => void,
    onCompleted: (response: string) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const messageHistory = [...messages];
      messageHistory.unshift({
        role: 'system',
        content: systemPrompt
      });
      
      const currentModel = selectedModel;
      const chatFunction = currentModel === 'deepseek' ? deepSeekChat : openAIChat;
      
      await chatFunction(
        { 
          messages: messageHistory,
          model: modelSelection.apiModel
        },
        {
          onStart: () => {
            console.log(`Starting to stream ${currentModel} response`);
            setIsStreaming(true);
          },
          onChunk: onChunkReceived,
          onComplete: (finalResponse: string) => {
            console.log(`${currentModel} stream completed`);
            setIsStreaming(false);
            currentStreamingMessageId.current = null;
            onCompleted(finalResponse);
          },
          onError: (error) => {
            console.error(`Error in ${currentModel} response:`, error);
            setIsStreaming(false);
            currentStreamingMessageId.current = null;
            onError(error);
          }
        }
      );
    } catch (error: any) {
      console.error('Error in chat stream:', error);
      setIsStreaming(false);
      currentStreamingMessageId.current = null;
      onError(error);
    }
  };

  return {
    isStreaming,
    setIsStreaming,
    isSending,
    setIsSending,
    currentStreamingMessageId,
    handleChatStream
  };
};
