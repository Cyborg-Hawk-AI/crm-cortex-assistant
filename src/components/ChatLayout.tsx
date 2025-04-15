
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
  const lastNavigationTimeRef = useRef(0);
  const restoredConversationIdRef = useRef<string | null>(null);
  
  // Add ref to track if sidebar is open
  const isSidebarOpenRef = useRef(false);

  // Check for forceReload parameter and pendingConversationId in location state
  useEffect(() => {
    const state = location.state as { 
      forceReload?: number,
      pendingConversationId?: string,
      newConversationId?: string
    } | undefined;

    // Handle pending conversation ID from navigation
    if (state?.pendingConversationId || state?.newConversationId) {
      const conversationId = state.pendingConversationId || state.newConversationId;
      console.log(`🔍 ChatLayout: Found pendingConversationId in state: ${conversationId}`);
      restoredConversationIdRef.current = conversationId;
      
      // If we don't have an active conversation set yet, use this one
      if (!activeConversationId && conversationId) {
        console.log(`🔄 ChatLayout: Setting active conversation to ${conversationId} from state`);
        setActiveConversationId(conversationId);
      }
    }
    
    if (state?.forceReload && state.forceReload > forceRefresh) {
      console.log(`🔍 ChatLayout: Detected forceReload flag: ${state.forceReload}`);
      setForceRefresh(state.forceReload);
      
      // Increment navigation attempt count for debugging
      navigationAttemptRef.current++;
      console.log(`📊 ChatLayout: Navigation attempt #${navigationAttemptRef.current}`);
      lastNavigationTimeRef.current = Date.now();
    }
  }, [location.state, forceRefresh, activeConversationId, setActiveConversationId]);

  // Set up debug effect to monitor relevant state
  useEffect(() => {
    console.log(`🏗️ ChatLayout: Component rendered with activeConversationId=${activeConversationId}, forceRefresh=${forceRefresh}, restoredId=${restoredConversationIdRef.current}`);
    
    // If we have a restored ID but no active conversation, set it
    if (restoredConversationIdRef.current && !activeConversationId) {
      console.log(`🔄 ChatLayout: Setting active conversation from restored ID: ${restoredConversationIdRef.current}`);
      setActiveConversationId(restoredConversationIdRef.current);
    }
  }, [activeConversationId, forceRefresh, setActiveConversationId]);

  // Respond immediately to conversation changes with enhanced logging
  useEffect(() => {
    if (activeConversationId) {
      console.log(`🔍 ChatLayout: Activating conversation: ${activeConversationId}`);
      
      // First set a flag to show we're handling this particular conversation
      const currentConversation = activeConversationId;
      
      // Force immediate refetch of messages for this conversation
      refetchMessages().then(() => {
        // Only proceed if this is still the active conversation 
        // (prevents race conditions if user switched conversations)
        if (currentConversation === activeConversationId) {
          console.log(`✅ ChatLayout: Messages refetched for conversation: ${activeConversationId}`);
          
          // Add more detailed logging
          console.log(`📊 ChatLayout: Chat section ref exists: ${!!chatSectionRef.current}`);
          
          // Schedule multiple scroll attempts with increasing delays
          [100, 300, 500, 1000].forEach(delay => {
            setTimeout(() => {
              if (chatSectionRef.current) {
                chatSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                console.log(`📜 ChatLayout: Scrolling chat section into view (delay: ${delay}ms)`);
              } else {
                console.log(`⚠️ ChatLayout: Chat section ref not available at ${delay}ms delay`);
              }
            }, delay);
          });
          
          // Attempt to force navigation to chat tab if needed
          const state = location.state as { activeTab?: string } | undefined;
          if (state?.activeTab !== 'chat') {
            console.log('🔄 ChatLayout: Current tab is not chat, attempting to navigate');
            
            const timestamp = Date.now();
            if (timestamp - lastNavigationTimeRef.current > 1000) { // Prevent navigation spam
              navigate('/', { 
                state: { 
                  activeTab: 'chat', 
                  forceReload: timestamp,
                  pendingConversationId: activeConversationId // Pass the conversation ID
                },
                replace: true
              });
              lastNavigationTimeRef.current = timestamp;
            }
          }
        }
      });
      
      // When on mobile, collapse the sidebar when a conversation is selected
      if (isMobile && sidebarRef.current) {
        sidebarRef.current.setIsOpen(false);
      }
    }
  }, [activeConversationId, refetchMessages, isMobile, forceRefresh, navigate, location.state]);

  // Set up document-wide click handler to close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close sidebar on mobile, and if it's open
      if (isMobile && isSidebarOpenRef.current && sidebarRef.current) {
        // Check if click is outside the sidebar element
        const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
        
        if (sidebarElement && !sidebarElement.contains(event.target as Node)) {
          console.log('🔍 ChatLayout: Click outside sidebar detected, closing sidebar');
          sidebarRef.current.setIsOpen(false);
          isSidebarOpenRef.current = false;
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  // Update sidebar open state reference
  const updateSidebarOpenState = (isOpen: boolean) => {
    console.log(`🔍 ChatLayout: Sidebar state changed to ${isOpen ? 'open' : 'closed'}`);
    isSidebarOpenRef.current = isOpen;
  };

  // Handle clicks in the chat area to collapse sidebar on mobile
  const handleChatAreaClick = () => {
    if (isMobile && sidebarRef.current && isSidebarOpenRef.current) {
      console.log('🔍 ChatLayout: Chat area clicked, closing sidebar');
      sidebarRef.current.setIsOpen(false);
      isSidebarOpenRef.current = false;
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
          onOpenChange={updateSidebarOpenState}
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
