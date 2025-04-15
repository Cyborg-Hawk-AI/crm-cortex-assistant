
import React, { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList } from '@/components/ConversationList';
import { ProjectGroupedConversations } from '@/components/ProjectGroupedConversations';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useQuery } from '@tanstack/react-query';
import * as messageApi from '@/api/messages';

// Add onOpenChange to props
interface ConversationSidebarProps {
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  startNewConversation: (title: string, projectId: string) => Promise<string>;
  onOpenChange?: (isOpen: boolean) => void;
}

export const ConversationSidebar = forwardRef<
  { setIsOpen: (open: boolean) => void },
  ConversationSidebarProps
>(({ activeConversationId, setActiveConversationId, startNewConversation, onOpenChange }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  
  // Fetch conversations directly using react-query
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations(),
  });
  
  // Update the imperative handle to expose setIsOpen method
  useImperativeHandle(ref, () => ({
    setIsOpen: (open: boolean) => setIsOpen(open)
  }));
  
  // Call onOpenChange when isOpen changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);
  
  // Keep sidebar permanently open on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);
  
  const startNewChat = async () => {
    try {
      const newConversationId = await startNewConversation('New conversation', '');
      setActiveConversationId(newConversationId);
      
      // Close the sidebar after selecting on mobile
      if (isMobile) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };
  
  // Filter conversations based on search
  const filteredConversations = searchQuery.trim() === '' 
    ? conversations
    : conversations.filter(convo => 
        convo.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Close the sidebar after selecting on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  // Mark the sidebar element with a data attribute for click-outside detection
  const sidebarAttr = {"data-sidebar": "sidebar"};
  
  // Desktop sidebar
  if (!isMobile) {
    return (
      <div className="flex-shrink-0 w-64 border-r border-border bg-slate-800" {...sidebarAttr}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <h2 className="font-semibold text-sm">Your Conversations</h2>
          <Button size="sm" variant="ghost" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2 space-y-1">
            {filteredConversations.length > 0 ? (
              <ProjectGroupedConversations 
                conversations={filteredConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
              />
            ) : (
              <ConversationList 
                conversations={filteredConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // Mobile sidebar (Sheet)
  return (
    <>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-3 left-3 z-10 bg-background/80 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SheetTrigger>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-72 p-0 border-r border-border bg-slate-800"
          {...sidebarAttr}
        >
          <div className="h-14 flex items-center justify-between px-4 border-b border-border">
            <h2 className="font-semibold text-sm">Your Conversations</h2>
            <Button size="sm" variant="ghost" onClick={startNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-2 space-y-1">
              {filteredConversations.length > 0 ? (
                <ProjectGroupedConversations 
                  conversations={filteredConversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                />
              ) : (
                <ConversationList 
                  conversations={filteredConversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
});

ConversationSidebar.displayName = 'ConversationSidebar';
