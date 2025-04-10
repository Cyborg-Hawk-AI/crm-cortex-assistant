
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/utils/auth';

// Comment type definition
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  profiles?: {
    full_name?: string;
  };
}

// Get comments for an entity
export const getComments = async (entityId: string, entityType: string): Promise<Comment[]> => {
  try {
    // First fetch the comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    if (!comments || comments.length === 0) {
      return [];
    }
    
    // Then fetch profiles for user names
    const userIds = Array.from(new Set(comments.map(comment => comment.user_id)));
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return comments;
    }
    
    // Create a map of user_id to profile data
    const profileMap: Record<string, any> = {};
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile;
    });
    
    // Attach profile data to comments
    return comments.map(comment => ({
      ...comment,
      profiles: profileMap[comment.user_id] || {}
    }));
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    return [];
  }
};

// Add a comment to an entity
export const addComment = async (entityId: string, entityType: string, content: string): Promise<Comment | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to add comments');
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        user_id: userId,
        entity_id: entityId,
        entity_type: entityType,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
    
    return data as Comment;
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
};

// Delete a comment (with permission check)
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User must be authenticated to delete comments');
    }
    
    // First check if the user owns this comment
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching comment:', fetchError);
      return false;
    }
    
    if (comment.user_id !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
      
    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
};
