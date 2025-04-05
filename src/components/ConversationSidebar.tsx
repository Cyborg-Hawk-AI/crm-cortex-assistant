
import React, { useState, useEffect } from 'react';
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

export function ConversationSidebar({ 
  activeConversationId, 
  setActiveConversationId,
  startNewConversation
}: ConversationSidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // Changed to false by default

  const { 
    data: conversations = [], 
    isLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
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

  return (
    <>
      {/* Sidebar Expander */}
      {!isOpen && (
        <div 
          className="h-full flex items-center cursor-pointer bg-background/50 border-r border-border/30 hover:bg-accent/10 transition-colors"
          onClick={toggleSidebar}
        >
          <div className="p-1">
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </div>
      )}
      
      <div className={`h-full ${isOpen ? 'w-64' : 'w-0'} bg-sidebar transition-all duration-300 border-r border-border/30`}>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 z-50 md:hidden"
            onClick={toggleSidebar}
          >
            {isOpen ? <MessageSquarePlus /> : <MessageSquarePlus />}
          </Button>
        )}

        <div className={`flex flex-col h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {/* Add close button for desktop */}
          {!isMobile && isOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3"
              onClick={toggleSidebar}
            >
              <ChevronLeft size={16} />
            </Button>
          )}
          
          <div className="p-3">
            <Button 
              className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary"
              onClick={handleNewConversation}
            >
              <Plus size={16} />
              New Chat
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex-1 overflow-y-auto py-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              <div className="space-y-1 px-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`
                      flex justify-between items-center rounded-md px-3 py-2 cursor-pointer 
                      ${activeConversationId === conversation.id ? 'bg-accent/30 text-accent-foreground' : 'hover:bg-accent/10'}
                    `}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{conversation.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        >
                          <Trash size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete conversation</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
