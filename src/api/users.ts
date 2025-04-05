
import { supabase } from '@/lib/supabase';

// Get all users for assignee selection
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Get current user profile
export const getCurrentUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching current user profile:', error);
    throw new Error(error.message);
  }
  
  return data;
};
