import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useProjects } from '@/hooks/useProjects';
import { cn } from "@/lib/utils";
import { ProjectDropdown } from '@/components/ProjectDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ConversationSidebarProps {}

export interface ConversationSidebarRef {
  setIsOpen: (open: boolean) => void;
}

export const ConversationSidebar = forwardRef<ConversationSidebarRef, ConversationSidebarProps>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const { toast } = useToast();
  const chatMessagesState = useChatMessages();
  const { 
    conversations,
    activeConversationId,
    setActiveConversationId,
    startConversation,
    refetchConversations,
    userAuthenticated
  } = chatMessagesState;
  const { 
    projects,
    activeProjectId,
    setActiveProjectId,
    isLoadingProjects,
    refetchProjects
  } = useProjects();
  const isMobile = useIsMobile();
  
  // Imperative handle to control the sidebar from outside
  useImperativeHandle(ref, () => ({
    setIsOpen: (open: boolean) => setIsOpen(open),
  }));

  // Add this logging in the useEffect inside the component:
  useEffect(() => {
    console.log('ConversationSidebar mounted. Fetching conversations...');
    
    // When sidebar is loaded, refresh conversations list to ensure latest data
    const fetchLatestData = async () => {
      if (chatMessagesState.userAuthenticated) {
        console.log('Refreshing conversation list data...');
        await chatMessagesState.refetchConversations?.();
      }
    };
    
    fetchLatestData();
    
    if (isMobile) {
      setIsOpen(false);
    }
  }, []);

  const handleStartConversation = async () => {
    if (!newConversationTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Conversation title cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    try {
      const conversationId = await startConversation(newConversationTitle);
      setActiveConversationId(conversationId);
      setNewConversationTitle('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation',
        variant: 'destructive'
      });
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleProjectClick = (projectId: string | null) => {
    setActiveProjectId(projectId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const renderConversationList = (conversations: any[], projectId: string | null = null) => {
    const filteredConversations = conversations.filter(c => c.project_id === projectId);
    
    if (!filteredConversations.length) {
      return <div className="px-4 py-2 text-sm text-muted-foreground">No conversations</div>;
    }

    return (
      <ul className="space-y-1">
        {filteredConversations.map(conversation => (
          <li key={conversation.id}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start rounded-md hover:bg-secondary/50",
                activeConversationId === conversation.id ? "bg-secondary/50" : "transparent"
              )}
              onClick={() => handleConversationClick(conversation.id)}
            >
              {conversation.title}
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rotate-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ActionBot</DialogTitle>
          <DialogDescription>
            Select a chat or start a new conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              New Chat
            </Label>
            <Input 
              id="name" 
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              className="col-span-3" 
            />
          </div>
          <Button onClick={handleStartConversation}>Start Conversation</Button>
        </div>

        <div className="py-4">
          <h2 className="text-lg font-semibold mb-2">Projects</h2>
          {isLoadingProjects ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-md hover:bg-secondary/50",
                    activeProjectId === null ? "bg-secondary/50" : "transparent"
                  )}
                  onClick={() => handleProjectClick(null)}
                >
                  Open Chats
                </Button>
                {renderConversationList(conversations, null)}
              </li>
              {projects?.map(project => (
                <li key={project.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-md hover:bg-secondary/50",
                      activeProjectId === project.id ? "bg-secondary/50" : "transparent"
                    )}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    {project.name}
                  </Button>
                  {renderConversationList(conversations, project.id)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button type="submit">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConversationSidebar.displayName = "ConversationSidebar";
