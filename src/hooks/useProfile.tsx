
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ensureProfileExists } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First ensure a profile exists
        await ensureProfileExists();
        
        // Then fetch the profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          setError(fetchError);
          
          if (fetchError.code === 'PGRST116') { // Record not found
            toast({
              title: "Profile Setup Issue",
              description: "Your profile couldn't be found. Please try signing out and back in.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error loading profile",
              description: fetchError.message,
              variant: "destructive",
            });
          }
          
        } else {
          setProfile(existingProfile as UserProfile);
        }
      } catch (error: any) {
        console.error('Unexpected error in useProfile:', error);
        setError(error);
        // Don't show toast here to avoid repeated errors
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};
