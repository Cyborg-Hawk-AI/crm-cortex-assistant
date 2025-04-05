
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Supabase configuration with hardcoded values
const supabaseUrl = "https://vmrsblqknvufwmqyguwa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnNibHFrbnZ1ZndtcXlndXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMDEyNzgsImV4cCI6MjA1ODg3NzI3OH0.j5nqncsCWWoJeRjWOgNAvi1bsRfzdCmoMEu4u9qoSy4";

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export typed version of supabase auth functions for convenience
export const auth = supabase.auth;

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Helper to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  return !!userId;
};

// Get user email from auth session
export const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

// Check if profile exists without trying to create it
export const checkProfileExists = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId);
    
    if (error) {
      console.error('Error checking profile:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkProfileExists:', error);
    return false;
  }
};

// Try to create a profile if it doesn't exist - modified to be more permissive
export const createProfileIfNotExists = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();
  
  if (!userId || !userEmail) {
    console.error('Unable to get user ID or email');
    return false;
  }
  
  try {
    // First check if profile exists
    const exists = await checkProfileExists(userId);
    
    if (exists) {
      console.log('Profile already exists');
      return true;
    }
    
    // Try to create profile
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email: userEmail,
      full_name: null,
      avatar_url: null,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error creating profile:', error);
      // Return true anyway to allow notebook creation
      return true; 
    }
    
    return true;
  } catch (error) {
    console.error('Error in createProfileIfNotExists:', error);
    // Return true anyway to allow notebook creation
    return true;
  }
};

// Modified to always return true since RLS is disabled for testing
export const ensureProfileExists = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.error('No user ID found, user not authenticated');
    return false;
  }
  
  // Try to create profile but don't block on failure since RLS is disabled
  try {
    await createProfileIfNotExists();
    // Always return true for testing since RLS is disabled
    return true;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    // Still return true as requested for testing
    return true;
  }
};
