
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

  // Refined PhD-level text color, glass drop shadow and logo surround
  const textColor =
    theme === 'dark'
      ? 'text-[#E3FCF9] drop-shadow-[0_0_7px_#00f7ef99]'
      : 'text-[#264E46] drop-shadow-[0_0_2px_#88D9CE]';

  return (
    <div 
      className={`cursor-pointer flex items-center select-none ${className}`}
      onClick={handleClick}
      style={{
        // Entire logo row floats above glass in dark, soft shadow
        filter: theme === 'dark'
          ? 'drop-shadow(0 0 12px #00f7ef99)'
          : 'none',
        background:
          theme === 'dark'
            ? 'linear-gradient(100deg, #263c54EE 70%, #151e2785 100%)'
            : 'transparent',
        borderRadius: theme === 'dark' ? 14 : 0,
        padding: theme === 'dark' ? '2.5px 7px 2.5px 2.5px' : undefined,
        boxShadow: theme === 'dark'
          ? '0 0 15px 0px #00f7ef50, 0 2px 13px rgba(40,60,80,0.19)'
          : undefined,
        transition: 'background 0.32s, box-shadow 0.32s, filter 0.32s'
      }}
    >
      <img 
        src="/lovable-uploads/48915536-c181-43e9-b281-a32b0297ba8d.png" 
        alt="action.it Logo" 
        className="h-8 w-8"
        style={{
          // Neon blending and glass effect for dark mode logo
          filter:
            theme === 'dark'
              ? 'drop-shadow(0 0 8px #00f7efbb) drop-shadow(0 0 3px #25384D)'
              : 'none',
          background: theme === 'dark'
            ? 'rgba(36, 62, 84, 0.97)'
            : 'transparent',
          borderRadius: theme === 'dark' ? 12 : 0,
          padding: theme === 'dark' ? '1.5px' : undefined,
          border: theme === 'dark' ? '1.5px solid #3AF3EF55' : undefined,
          boxShadow: theme === 'dark'
            ? '0 0 10px #00f7ef40'
            : undefined,
          transition: 'background 0.32s, border 0.24s, box-shadow 0.32s, filter 0.32s'
        }}
      />
      {showText && (
        <span className={`font-bold text-lg ml-2 ${textColor} transition-colors duration-300`}
          style={{
            letterSpacing: theme === 'dark' ? '0.03em' : undefined,
            background:
              theme === 'dark'
                ? 'linear-gradient(97deg, #00f7ef 0%, #d9e9e7 80%)'
                : undefined,
            WebkitBackgroundClip: theme === 'dark' ? 'text' : undefined,
            WebkitTextFillColor: theme === 'dark' ? 'transparent' : undefined,
            filter: theme === 'dark'
              ? 'drop-shadow(0 0 8px #00f7ef90)'
              : undefined
          }}
        >
          action.it
        </span>
      )}
    </div>
  );
};
