
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CommentList } from './CommentList';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  userId: string;
  userName?: string;
  onAddComment?: (comment: string) => Promise<void>;
}

export function CommentSection({ 
  taskId, 
  comments = [], 
  userId,
  userName,
  onAddComment 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(newComment.trim());
      }
      
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CommentList comments={comments} maxHeight="300px" />
      
      <div className="flex items-start gap-2 mt-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userId}`} />
          <AvatarFallback>
            {(userName || userId).substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <Button 
              onClick={handleAddComment}
              className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
              disabled={!newComment.trim() || isSubmitting}
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              {isSubmitting ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
