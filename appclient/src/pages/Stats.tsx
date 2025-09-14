import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import BusinessStats from '../components/BusinessStats';

export default function Stats() {
  const { currentTheme } = useTheme();

  return (
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
  );
}