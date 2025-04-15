
import React from 'react';
import { Conversation } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProjectGroupedConversationsProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ProjectGroupedConversations = ({
  conversations,
  activeConversationId,
  onSelectConversation
}: ProjectGroupedConversationsProps) => {
  // Group conversations by project
  const projectMap = new Map<string, Conversation[]>();
  const openChats: Conversation[] = [];
  
  conversations.forEach((conversation) => {
    if (!conversation.project_id) {
      openChats.push(conversation);
    } else {
      if (!projectMap.has(conversation.project_id)) {
        projectMap.set(conversation.project_id, []);
      }
      projectMap.get(conversation.project_id)?.push(conversation);
    }
  });
  
  // Sort conversations by date (newest first)
  const sortedOpenChats = [...openChats].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Open chats section */}
      {sortedOpenChats.length > 0 && (
        <div>
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 px-1 hover:bg-gray-800/50 rounded">
              <div className="flex items-center">
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Open Chats</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5 mt-1 space-y-1">
              {sortedOpenChats.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="truncate">
                    {conversation.title || "New conversation"}
                  </div>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Project grouped chats */}
      {Array.from(projectMap).map(([projectId, projectConversations]) => {
        // Find project name
        const projectName = projectConversations.length > 0 && projectConversations[0].project_name 
          ? projectConversations[0].project_name 
          : projectId;

        // Sort project conversations by date
        const sortedConversations = [...projectConversations].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return (
          <div key={projectId}>
            <Collapsible defaultOpen={sortedConversations.some(c => c.id === activeConversationId)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 px-1 hover:bg-gray-800/50 rounded">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                  <Folder className="h-4 w-4 mr-1 text-neon-purple/80" />
                  <span>{projectName}</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-5 mt-1 space-y-1">
                {sortedConversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="truncate">
                      {conversation.title || "New conversation"}
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}

      {conversations.length === 0 && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No conversations found
        </div>
      )}
    </div>
  );
};
