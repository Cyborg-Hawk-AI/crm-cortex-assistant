
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
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
  
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-sm text-[#718096] my-3">
        No comments yet.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[200px]">
      <div className="space-y-4 mb-4 pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_id}`} />
              <AvatarFallback>
                {(comment.user_name || comment.user_id).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#F1F5F9]">
                  {comment.user_name || comment.user_id}
                </span>
                <span className="text-xs text-[#718096]">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-[#CBD5E1] mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
