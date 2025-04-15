
import React, { useEffect, useRef, useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatSection } from './ChatSection';
import { useChatMessages } from '@/hooks/useChatMessages';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, useNavigate } from 'react-router-dom';

export function ChatLayout() {
  const { 
    activeConversationId,
    setActiveConversationId,
    startConversation,
    messages,
    isLoading,
    refetchMessages
  } = useChatMessages();
  
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<{ setIsOpen: (open: boolean) => void }>({ setIsOpen: () => {} });
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Add tracking for attempted navigations
  const navigationAttemptRef = useRef(0);

  // Check for forceReload parameter in location state
  useEffect(() => {
    const state = location.state as { forceReload?: number } | undefined;
    if (state?.forceReload && state.forceReload > forceRefresh) {
      console.log(`ChatLayout: Detected forceReload flag: ${state.forceReload}`);
      setForceRefresh(state.forceReload);
      
      // Increment navigation attempt count for debugging
      navigationAttemptRef.current++;
      console.log(`ChatLayout: Navigation attempt #${navigationAttemptRef.current}`);
    }
  }, [location.state, forceRefresh]);

  // Set up debug effect to monitor relevant state
  useEffect(() => {
    console.log(`ChatLayout: Component rendered with activeConversationId=${activeConversationId}, forceRefresh=${forceRefresh}`);
  }, [activeConversationId, forceRefresh]);

  // Immediately respond to conversation changes with enhanced logging
  useEffect(() => {
    if (activeConversationId) {
      console.log(`ChatLayout: Activating conversation: ${activeConversationId}`);
      
      // First set a flag to show we're handling this particular conversation
      const currentConversation = activeConversationId;
      
      // Force immediate refetch of messages for this conversation
      refetchMessages().then(() => {
        // Only proceed if this is still the active conversation 
        // (prevents race conditions if user switched conversations)
        if (currentConversation === activeConversationId) {
          console.log(`ChatLayout: Messages refetched for conversation: ${activeConversationId}`);
          
          // Add more detailed logging
          console.log(`ChatLayout: Chat section ref exists: ${!!chatSectionRef.current}`);
          
          // Schedule multiple scroll attempts with increasing delays
          [100, 300, 500].forEach(delay => {
            setTimeout(() => {
              if (chatSectionRef.current) {
                chatSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                console.log(`ChatLayout: Scrolling chat section into view (delay: ${delay}ms)`);
              } else {
                console.log(`ChatLayout: Chat section ref not available at ${delay}ms delay`);
              }
            }, delay);
          });
          
          // Attempt to force navigation to chat tab if needed
          const state = location.state as { activeTab?: string } | undefined;
          if (state?.activeTab !== 'chat') {
            console.log('ChatLayout: Current tab is not chat, attempting to navigate');
            navigate('/', { 
              state: { 
                activeTab: 'chat', 
                forceReload: Date.now() 
              }
            });
          }
        }
      });
      
      // When on mobile, collapse the sidebar when a conversation is selected
      if (isMobile && sidebarRef.current) {
        sidebarRef.current.setIsOpen(false);
      }
    }
  }, [activeConversationId, refetchMessages, isMobile, forceRefresh, navigate, location.state]);

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
          key={`chat-section-${activeConversationId || 'new'}-${forceRefresh}`}
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
