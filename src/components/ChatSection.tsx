
import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType } from '@/utils/types';
import { Message } from './Message';
import { HomeButton } from './HomeButton';
import { useModelSelection } from '@/hooks/useModelSelection';
import { ModelSelector } from './ModelSelector';

// Style import
import './chat.css';

interface ChatSectionProps {
  activeConversationId: string | null;
  messages: MessageType[];
  isLoading: boolean;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ 
  activeConversationId,
  messages,
  isLoading,
}) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getBrandedName } = useModelSelection();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <div className="relative flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <HomeButton />
      
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {activeConversationId ? (
          <>
            <div className="flex flex-col space-y-4 pb-20">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
                  <div className="text-2xl font-bold text-center mb-2">
                    Welcome to {getBrandedName()}
                  </div>
                  <p className="text-center max-w-md">
                    Your engineering command center ready to assist with technical tasks, code, and project management.
                  </p>
                  
                  {/* Add the model selector */}
                  <div className="mt-8 w-full max-w-md">
                    <ModelSelector />
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <Message 
                      key={message.id} 
                      message={message} 
                    />
                  ))}
                  {isTyping && (
                    <div className="flex-start">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Select a conversation</div>
              <p>Choose an existing conversation from the sidebar or start a new one.</p>
              
              {/* Add the model selector even when no conversation is active */}
              <div className="mt-8 w-full max-w-md mx-auto">
                <ModelSelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
