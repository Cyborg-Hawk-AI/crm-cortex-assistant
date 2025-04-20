
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
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from 
        from-[#88D9CE] to-[#264E46]">
        Action.it
      </span>
    </div>
  );
};
