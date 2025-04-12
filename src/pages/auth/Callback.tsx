
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error handling auth callback:', error);
          navigate('/login?error=auth-callback-failed');
          return;
        }

        if (data?.session) {
          // Auth successful, navigate to home page or dashboard
          navigate('/');
        } else {
          // No session found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Processing Login</h1>
        <p className="text-muted-foreground mt-2">Please wait while we complete your authentication...</p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-neon-purple rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-4 w-4 bg-neon-purple rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-4 w-4 bg-neon-purple rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
