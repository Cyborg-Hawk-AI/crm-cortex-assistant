
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  profiles?: {
    full_name?: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  maxHeight?: string;
}

export function CommentList({ comments, maxHeight = "200px" }: CommentListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Helper function to get the display name for a comment
  const getDisplayName = (comment: Comment): string => {
    // First priority: full_name from profiles object
    if (comment.profiles?.full_name) {
      return comment.profiles.full_name;
    }
    
    // Second priority: user_name field if it exists
    if (comment.user_name) {
      return comment.user_name;
    }
    
    // Fallback: use first part of user ID
    return comment.user_id.substring(0, 8) + "...";
  };
  
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-sm text-[#718096] my-3">
        No comments yet.
      </div>
    );
  }

  return (
    <ScrollArea className="w-full" style={{ maxHeight }}>
      <div className="space-y-4 mb-4 pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id}`} />
              <AvatarFallback>
                {(getDisplayName(comment).substring(0, 2) || "").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs text-[#F1F5F9] mb-1 whitespace-pre-wrap break-words">{comment.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#CBD5E1]">
                  {getDisplayName(comment)}
                </span>
                <span className="text-xxs text-[#718096]">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
