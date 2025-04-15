
import React from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/utils/types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = ({ 
  conversations, 
  activeConversationId,
  onSelectConversation 
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No conversations found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <Button
          key={conversation.id}
          variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
          className="w-full justify-start text-left h-auto py-2 px-3"
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="truncate">
            {conversation.title || "New conversation"}
          </div>
        </Button>
      ))}
    </div>
  );
};
