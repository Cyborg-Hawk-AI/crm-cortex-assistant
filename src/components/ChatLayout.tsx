
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

  // Immediately respond to conversation changes
  useEffect(() => {
    if (activeConversationId) {
      console.log(`ChatLayout: Activating conversation: ${activeConversationId}`);
      
      // Force immediate refetch of messages for this conversation
      refetchMessages().then(() => {
        console.log(`ChatLayout: Messages refetched for conversation: ${activeConversationId}`);
        
        // Ensure chat section is visible after messages are loaded
        if (chatSectionRef.current) {
          console.log('ChatLayout: Scrolling chat section into view');
          setTimeout(() => {
            chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100); // Small delay to ensure DOM has updated
        }
      });
      
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
        <ConversationSidebar 
          ref={sidebarRef}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          startNewConversation={startConversation}
        />
        
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
