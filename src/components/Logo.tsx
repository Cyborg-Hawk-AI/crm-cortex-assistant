
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <div 
      className={`cursor-pointer flex items-center ${className}`}
      onClick={handleClick}
    >
      <img 
        src="/lovable-uploads/48915536-c181-43e9-b281-a32b0297ba8d.png" 
        alt="action.it Logo" 
        className="h-8 w-8"
      />
      {showText && (
        <span className="text-[#264E46] font-bold text-lg ml-2">action.it</span>
      )}
    </div>
  );
};
