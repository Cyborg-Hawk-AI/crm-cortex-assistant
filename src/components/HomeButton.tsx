
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HomeButton = () => {
  const navigate = useNavigate();
  
  const goHome = () => {
    navigate('/');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={goHome} 
      className="absolute top-4 left-4 z-50 bg-gradient-to-r from-neon-purple to-neon-purple/80 text-white hover:brightness-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      title="Return to Command Center"
    >
      <Home className="h-5 w-5" />
    </Button>
  );
};
