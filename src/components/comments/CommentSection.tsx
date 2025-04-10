
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[#F1F5F9] flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          Comments
        </h3>
      </div>
      
      <div className="bg-[#1C2A3A]/50 p-4 rounded-md">
        {comments.length > 0 ? (
          <div className="space-y-4 mb-4">
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
        ) : (
          <div className="text-center text-sm text-[#718096] mb-3">
            No comments yet. Add one below.
          </div>
        )}
        
        {/* Inline comment editor */}
        <div className="flex items-start gap-2">
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
    </div>
  );
}
