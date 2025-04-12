
import React, { useEffect, useRef, useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatSection } from './ChatSection';
import { useChatMessages } from '@/hooks/useChatMessages';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

export function ChatLayout() {
  const chatMessagesState = useChatMessages();
  const { 
    activeConversationId,
    setActiveConversationId,
    startConversation,
    messages,
    isLoading,
    refetchMessages
  } = chatMessagesState;
  
  const isMobile = useIsMobile();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<{ setIsOpen: (open: boolean) => void }>({ setIsOpen: () => {} });
  const [isMounted, setIsMounted] = useState(false);
  const userAuthenticated = chatMessagesState.userAuthenticated;

  // Track mounted state to force refetch when component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // When activeConversationId changes, refetch messages
  useEffect(() => {
    if (activeConversationId && isMounted) {
      console.log(`Loading messages for conversation in layout: ${activeConversationId}`);
      refetchMessages();
    }
  }, [activeConversationId, refetchMessages, isMounted]);

  // Handle clicks in the chat area to collapse sidebar on mobile
  const handleChatAreaClick = () => {
    if (isMobile && sidebarRef.current) {
      sidebarRef.current.setIsOpen(false);
    }
  };

  // Show loading state while authentication status is being determined
  if (userAuthenticated === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-purple mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing ActionBot...</p>
        </div>
      </div>
    );
  }

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
