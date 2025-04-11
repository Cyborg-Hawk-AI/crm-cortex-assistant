import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquarePlus, Plus, Trash, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getConversations, deleteConversation } from '@/api/messages';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
interface ConversationSidebarProps {
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  startNewConversation: (title?: string) => Promise<string>;
}
export const ConversationSidebar = forwardRef<{
  setIsOpen: (open: boolean) => void;
}, ConversationSidebarProps>(({
  activeConversationId,
  setActiveConversationId,
  startNewConversation
}, ref) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // Changed to false by default

  // Expose the setIsOpen method via ref
  useImperativeHandle(ref, () => ({
    setIsOpen
  }));
  const {
    data: conversations = [],
    isLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);
  const handleNewConversation = async () => {
    // We'll no longer create a conversation here, we'll just reset the active ID
    // so the user sees the "Start new conversation" screen
    setActiveConversationId(null);
    if (isMobile) setIsOpen(false);
  };
  const handleConversationClick = (conversationId: string) => {
    if (conversationId !== activeConversationId) {
      console.log(`Switching to conversation: ${conversationId}`);
      setActiveConversationId(conversationId);
    }
    if (isMobile) setIsOpen(false);
  };
  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteConversation(conversationId);
    refetchConversations();
    if (conversationId === activeConversationId) {
      const remainingConversations = conversations.filter(c => c.id !== conversationId);
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        setActiveConversationId(null); // Just show the empty state instead of creating a new conversation
      }
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return <>
      {/* Sidebar Expander - Now more visible with animation */}
      {!isOpen && <div className="h-full flex items-center cursor-pointer bg-gradient-to-r from-neon-purple/20 to-transparent hover:from-neon-purple/40 transition-all duration-300 border-r border-neon-purple/20" onClick={toggleSidebar}>
          <div className="p-2 bg-white rounded-full shadow-lg mr-[-12px] neon-glow-purple">
            <ChevronRight size={16} className="text-neon-purple animate-pulse" />
          </div>
        </div>}
      
      <div className={`h-full ${isOpen ? 'w-72' : 'w-0'} bg-gradient-to-b from-[#f8f9ff] to-[#f1f0fb] transition-all duration-300 border-r border-neon-purple/20 shadow-lg`}>
        {isMobile && <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-50 md:hidden" onClick={toggleSidebar}>
            <MessageSquarePlus />
          </Button>}

        <div className={`flex flex-col h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {/* Close button with more visible styling */}
          {!isMobile && isOpen && <Button variant="ghost" size="icon" className="absolute top-3 right-3 hover:bg-neon-purple/10 rounded-full" onClick={toggleSidebar}>
              <ChevronLeft size={16} className="text-neon-purple" />
            </Button>}
          
          <div className="p-4">
            <Button className="w-full justify-start gap-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-full shadow-md hover:shadow-lg hover:brightness-110 transition-all" onClick={handleNewConversation}>
              <Plus size={16} />
              New Chat
            </Button>
          </div>
          
          <Separator className="bg-neon-purple/20" />
          
          <div className="flex-1 overflow-y-auto py-3 px-2 bg-slate-800">
            {isLoading ? <div className="flex justify-center p-4">
                <div className="loading-dots flex items-center">
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse"></div>
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                animationDelay: '0.2s'
              }}></div>
                  <div className="h-2 w-2 bg-neon-purple rounded-full mx-1 animate-pulse" style={{
                animationDelay: '0.4s'
              }}></div>
                </div>
              </div> : conversations.length === 0 ? <div className="p-4 text-center text-gray-500 italic">No conversations yet</div> : <div className="space-y-2 px-2">
                {conversations.map(conversation => <div key={conversation.id} className={`
                      group flex justify-between items-center rounded-xl px-3 py-2.5 cursor-pointer hover-scale
                      transition-all duration-200 border hover:border-neon-purple/30
                      ${activeConversationId === conversation.id ? 'bg-white shadow-md border-neon-purple/30 neon-glow-purple' : 'bg-white/60 border-transparent hover:bg-white hover:shadow-sm'}
                    `} onClick={() => handleConversationClick(conversation.id)}>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${activeConversationId === conversation.id ? 'text-neon-purple' : ''}`}>
                        {conversation.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 hover:bg-red-100 hover:text-red-500 rounded-full transition-all" onClick={e => handleDeleteConversation(conversation.id, e)}>
                          <Trash size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete conversation</TooltipContent>
                    </Tooltip>
                  </div>)}
              </div>}
          </div>
        </div>
      </div>
    </>;
});
ConversationSidebar.displayName = 'ConversationSidebar';