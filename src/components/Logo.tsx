
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`cursor-pointer flex items-center ${className}`}
      onClick={() => navigate('/')}
    >
      <img 
        src="/lovable-uploads/48915536-c181-43e9-b281-a32b0297ba8d.png" 
        alt="Action.it Logo" 
        className="h-8 w-8 mr-2"
      />
      <span className="text-[#264E46] font-bold text-lg">Action.it</span>
    </div>
  );
};
