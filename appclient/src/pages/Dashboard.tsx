import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import BusinessStats from '../components/BusinessStats';

export default function Dashboard() {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: currentTheme.colors.background.primary }}
    >
      {/* Header */}
      <div 
        className={`shadow transition-colors duration-300 ${
          currentTheme.type === 'light' ? 'light-header-panel' : ''
        }`}
        style={{ 
          backgroundColor: currentTheme.colors.background.secondary,
          borderBottom: currentTheme.type === 'light' ? 'none' : `1px solid ${currentTheme.colors.border.primary}`
        }}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          currentTheme.type === 'light' ? 'py-8' : 'py-6'
        }`}>
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 
                className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate transition-colors duration-300"
                style={{ color: currentTheme.colors.text.primary }}
              >
                Portal Services - Statistics
              </h2>
              <p 
                className="mt-1 text-sm transition-colors duration-300"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                Sistema de gestão de serviços e orçamentos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto sm:px-6 lg:px-8 ${
        currentTheme.type === 'light' ? 'py-8' : 'py-6'
      }`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 
              className="text-3xl font-bold transition-colors duration-300"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Business Statistics
            </h1>
          </div>
          
          <BusinessStats />
        </div>
      </div>
    </div>
  );
};