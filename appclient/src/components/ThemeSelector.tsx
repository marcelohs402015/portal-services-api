import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <SunIcon className="w-4 h-4 text-blue-500" />;
      case 'purple':
        return <MoonIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <MoonIcon className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
          currentTheme.type === 'light' 
            ? 'light-glass shadow-light-soft' 
            : 'glass-dark shadow-soft'
        }`}
        style={{
          backgroundColor: currentTheme.type === 'light' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255, 255, 255, 0.15)',
          borderColor: currentTheme.type === 'light' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          color: currentTheme.type === 'light' ? '#0369a1' : 'white'
        }}
      >
        {getThemeIcon(currentTheme.type)}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-16 backdrop-blur-sm border rounded-lg shadow-xl z-50 ${
          currentTheme.type === 'light' 
            ? 'light-glass border-gray-200' 
            : 'glass-dark border-gray-600'
        }`}>
          <div className="py-2">
            {availableThemes.map((theme) => (
              <button
                key={theme.type}
                onClick={() => {
                  console.log('Clicking theme:', theme.name, theme.type);
                  setTheme(theme.type);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-center px-2 py-3 text-sm transition-colors duration-150 ${
                  currentTheme.type === 'light'
                    ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    : 'text-gray-300 hover:bg-purple-500/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  {getThemeIcon(theme.type)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
