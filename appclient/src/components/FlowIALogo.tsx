import React from 'react';

interface PortalServicesLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  isCollapsed?: boolean;
}

const PortalServicesLogo: React.FC<PortalServicesLogoProps> = ({ 
  width = 200, 
  height = 60, 
  showText = true,
  variant = 'light',
  showTagline = false,
  isCollapsed = false
}) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Modern Text Design */}
      {showText && (
        <div className="flex flex-col justify-center items-center w-full">
          <div className="relative group">
            {/* Main Text with Gradient */}
            <span 
              className="font-bold tracking-wide relative z-10 transition-all duration-300 group-hover:scale-105"
              style={{ 
                fontSize: isCollapsed ? '14px' : '22px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: isCollapsed ? '0.3px' : '0.8px',
                lineHeight: '1.1'
              }}
            >
              {isCollapsed ? 'F' : 'FLOWZI'}
            </span>
            
            {/* Subtle Glow Effect */}
            <div 
              className="absolute inset-0 blur-sm opacity-25 transition-all duration-300 group-hover:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: 'translate(0.5px, 0.5px)'
              }}
            >
              {isCollapsed ? 'F' : 'FLOWZI'}
            </div>
            
            {/* Animated Background Glow */}
            <div 
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-15 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                transform: 'scale(1.1)'
              }}
            />
          </div>
          
          {/* AI Solutions Tagline */}
          {!isCollapsed && showTagline && (
            <div className="text-xs text-blue-200 mt-0.5 font-medium tracking-wider opacity-75 transition-all duration-300 group-hover:opacity-90">
              AI SOLUTIONS
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalServicesLogo;
