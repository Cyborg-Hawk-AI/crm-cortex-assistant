import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error.message);
          throw error;
        }
        
        console.log("Session check result:", data.session ? "Active session found" : "No session found");
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Failed to get session:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      console.log("Signing up user:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) {
        console.error("Signup error:", error.message);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { data: null, error };
      }

      console.log("Signup API response:", data);
      
      if (data.user) {
        // Create a profile record
        console.log("Creating profile for user:", data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id, 
            email: email,
            full_name: fullName,
          }]);
        
        if (profileError) {
          console.error("Profile creation error:", profileError.message);
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          });
        } else {
          console.log("Profile created successfully");
          toast({
            title: "Sign up successful",
            description: "Please check your email for a confirmation link.",
          });
        }
      }

      return { data, error: null };
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed in successfully",
      });
    }

    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    navigate('/login');
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "Reset password failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for a reset link.",
      });
    }

    setLoading(false);
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated successfully",
      });
      navigate('/');
    }

    setLoading(false);
    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
