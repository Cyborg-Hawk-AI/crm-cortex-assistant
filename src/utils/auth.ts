
import { supabase } from '@/lib/supabase';

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  return !!userId;
};
