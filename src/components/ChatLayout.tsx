
import React, { useEffect, useRef } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatSection } from './ChatSection';
import { useChatMessages } from '@/hooks/useChatMessages';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export function ChatLayout() {
  const { 
    activeConversationId,
    setActiveConversationId,
    startConversation,
    messages,
    isLoading,
    refetchMessages
  } = useChatMessages();
  
  const isMobile = useIsMobile();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<{ setIsOpen: (open: boolean) => void }>({ setIsOpen: () => {} });

  // When activeConversationId changes, refetch messages
  useEffect(() => {
    if (activeConversationId) {
      console.log(`Loading messages for conversation in layout: ${activeConversationId}`);
      refetchMessages();
      
      // When on mobile, collapse the sidebar when a conversation is selected
      if (isMobile && sidebarRef.current) {
        sidebarRef.current.setIsOpen(false);
      }
    }
  }, [activeConversationId, refetchMessages, isMobile]);

  // Handle clicks in the chat area to collapse sidebar on mobile
  const handleChatAreaClick = () => {
    if (isMobile && sidebarRef.current) {
      sidebarRef.current.setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden">
        {/* Conversation Sidebar with ref for controlling from outside */}
        <ConversationSidebar 
          ref={sidebarRef}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          startNewConversation={startConversation}
        />
        
        {/* Main Chat Area */}
        <div 
          className="flex-1 overflow-hidden flex flex-col"
          onClick={handleChatAreaClick}
          ref={chatSectionRef}
        >
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
