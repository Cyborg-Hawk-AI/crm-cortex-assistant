
import React, { useEffect, useRef } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatSection } from './ChatSection';
import { useChatMessages } from '@/hooks/useChatMessages';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // When activeConversationId changes, refetch messages, focus chat section, and navigate if needed
  useEffect(() => {
    if (activeConversationId) {
      console.log(`Active conversation changed to: ${activeConversationId}. Loading messages.`);
      
      // If we're on the main page, navigate to chat view
      if (window.location.pathname === '/') {
        console.log(`Navigating to conversation: ${activeConversationId}`);
        navigate(`/chat/${activeConversationId}`);
      }
      
      refetchMessages();
      
      // Ensure chat section is visible and focused
      if (chatSectionRef.current) {
        chatSectionRef.current.focus();
        console.log(`Chat section for conversation ${activeConversationId} is now focused`);
      }
      
      // When on mobile, collapse the sidebar when a conversation is selected
      if (isMobile && sidebarRef.current) {
        sidebarRef.current.setIsOpen(false);
      }
    }
  }, [activeConversationId, refetchMessages, isMobile, navigate]);

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
          tabIndex={0} // Make focusable
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
