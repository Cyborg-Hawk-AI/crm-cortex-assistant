
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

  const isDark = theme === 'dark';

  return (
    <div 
      className={`cursor-pointer flex items-center select-none ${className}`}
      onClick={handleClick}
      style={{
        // Glass container for logo in dark mode
        background: isDark 
          ? 'linear-gradient(100deg, rgba(38, 60, 84, 0.95) 70%, rgba(21, 30, 39, 0.85) 100%)'
          : 'transparent',
        borderRadius: isDark ? 14 : 0,
        padding: isDark ? '2.5px 8px 2.5px 2.5px' : '0',
        boxShadow: isDark
          ? '0 0 15px 0px rgba(0, 247, 239, 0.25), 0 2px 13px rgba(40, 60, 80, 0.2)'
          : 'none',
        transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDark ? '1px solid rgba(58, 243, 239, 0.15)' : 'none',
      }}
    >
      <img 
        src="/lovable-uploads/48915536-c181-43e9-b281-a32b0297ba8d.png" 
        alt="action.it Logo" 
        className="h-8 w-8"
        style={{
          // Neon effect for logo icon
          filter: isDark
            ? 'drop-shadow(0 0 8px rgba(0, 247, 239, 0.7)) drop-shadow(0 0 3px rgba(37, 56, 77, 1))'
            : 'none',
          background: isDark
            ? 'rgba(36, 62, 84, 0.97)'
            : 'transparent',
          borderRadius: isDark ? 12 : 0,
          padding: isDark ? '1.5px' : '0',
          border: isDark ? '1.5px solid rgba(58, 243, 239, 0.33)' : 'none',
          boxShadow: isDark
            ? '0 0 10px rgba(0, 247, 239, 0.25)'
            : 'none',
          transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      {showText && (
        <span 
          className={`font-bold text-lg ml-2 transition-all duration-300`}
          style={{
            letterSpacing: isDark ? '0.03em' : 'normal',
            background: isDark
              ? 'linear-gradient(97deg, rgba(0, 247, 239, 1) 0%, rgba(217, 233, 231, 1) 80%)'
              : '',
            WebkitBackgroundClip: isDark ? 'text' : 'unset',
            WebkitTextFillColor: isDark ? 'transparent' : 'unset',
            color: !isDark ? '#264E46' : undefined,
            filter: isDark
              ? 'drop-shadow(0 0 8px rgba(0, 247, 239, 0.5))'
              : 'drop-shadow(0 0 2px #88D9CE)',
            textShadow: isDark ? '0 0 20px rgba(0, 247, 239, 0.3)' : 'none'
          }}
        >
          action.it
        </span>
      )}
    </div>
  );
};
