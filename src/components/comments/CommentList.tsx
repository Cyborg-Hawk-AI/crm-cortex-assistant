
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';

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
  onRefreshComments?: () => void;
}

export function CommentList({ comments, maxHeight = "200px", onRefreshComments }: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    
    fetchCurrentUserId();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStartEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedContent.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', currentUserId) // Ensure user can only edit their own comments
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Comment updated",
        description: "Your comment has been successfully updated",
      });
      
      if (onRefreshComments) {
        onRefreshComments();
      }
      
      setEditingCommentId(null);
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      });
    }
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
                {(comment.user_name || comment.profiles?.full_name || "").substring(0, 2).toUpperCase() || comment.user_id.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <Textarea 
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[80px] bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEditing}
                      className="text-[#CBD5E1]"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#F1F5F9] mb-1 whitespace-pre-wrap break-words">{comment.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-[#CBD5E1]">
                      {comment.profiles?.full_name || comment.user_name || comment.user_id.substring(0, 8)}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentUserId === comment.user_id && (
                        <button 
                          onClick={() => handleStartEditing(comment)}
                          className="text-[#718096] hover:text-[#CBD5E1] p-1 rounded-full"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                      <span className="text-xxs text-[#718096]">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
