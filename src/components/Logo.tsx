
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, onClick }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  // Dynamically blend text with background for both light & dark
  const textColor =
    theme === 'dark'
      ? 'text-[#D9E9E7] drop-shadow-[0_0_6px_#25384D]'
      : 'text-[#264E46] drop-shadow-[0_0_2px_#88D9CE]';

  return (
    <div 
      className={`cursor-pointer flex items-center ${className}`}
      onClick={handleClick}
    >
      <img 
        src="/lovable-uploads/48915536-c181-43e9-b281-a32b0297ba8d.png" 
        alt="action.it Logo" 
        className="h-8 w-8"
        style={
          theme === 'dark'
            ? { filter: 'drop-shadow(0 0 8px #25384D)', background: 'rgba(49, 73, 104, 0.82)', borderRadius: 8, padding: '2px' }
            : {}
        }
      />
      {showText && (
        <span className={`font-bold text-lg ml-2 ${textColor} transition-colors duration-300`}>action.it</span>
      )}
    </div>
  );
};

