
import React, { useEffect } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatSection } from './ChatSection';
import { useChatMessages } from '@/hooks/useChatMessages';
import { TooltipProvider } from '@/components/ui/tooltip';

export function ChatLayout() {
  const { 
    activeConversationId,
    setActiveConversationId,
    startConversation,
    messages,
    isLoading,
    refetchMessages
  } = useChatMessages();

  // When activeConversationId changes, refetch messages
  useEffect(() => {
    if (activeConversationId) {
      console.log(`Loading messages for conversation in layout: ${activeConversationId}`);
      refetchMessages();
    }
  }, [activeConversationId, refetchMessages]);

  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden">
        {/* Conversation Sidebar */}
        <ConversationSidebar 
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          startNewConversation={startConversation}
        />
        
        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatSection
            activeConversationId={activeConversationId}
            messages={messages}
            isLoading={isLoading}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
