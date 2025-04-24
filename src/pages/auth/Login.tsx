
import LoginForm from '@/components/auth/LoginForm';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if there's a message from another page (e.g., successful signup)
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setMessage(state.message);
      toast({
        title: "Notice",
        description: state.message,
      });
      
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">aAction.it</h1>
        <p className="text-muted-foreground mt-2">Sign in to access your account</p>
      </div>
      
      {message && (
        <div className="w-full max-w-md mb-6 p-4 bg-primary/10 rounded-md text-center">
          {message}
        </div>
      )}
      
      <LoginForm />
    </div>
  );
}
