
import LoginForm from '@/components/auth/LoginForm';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setMessage(state.message);
      toast({
        title: "Notice",
        description: state.message,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-[#F9F9F9]">
      <div className="mb-8 text-center">
        <Logo className="mb-4" />
        <h1 className="text-[#404040] text-3xl font-bold">Welcome Back</h1>
        <p className="text-[#BFBFBF] mt-2">Sign in to access your account</p>
      </div>
      
      {message && (
        <div className="w-full max-w-md mb-6 p-4 bg-[#C1EDEA]/10 rounded-md text-center text-[#264E46]">
          {message}
        </div>
      )}
      
      <LoginForm />
    </div>
  );
}
