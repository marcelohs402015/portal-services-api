import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLanguage);
  };

  const currentLang = i18n.language === 'pt' ? 'pt' : 'en';
  const nextLang = currentLang === 'pt' ? 'en' : 'pt';

  return (
    <div className="px-4 py-2 border-t border-gray-200">
      <button
        onClick={toggleLanguage}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-primary-300"
        title={currentLang === 'pt' ? 'Mudar para Inglês' : 'Switch to Portuguese'}
      >
        <div className="flex items-center space-x-2">
          <LanguageIcon className="h-4 w-4" />
          <span className="text-xs">
            {currentLang === 'pt' ? 'Português' : 'English'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            currentLang === 'pt' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            PT
          </span>
          <span className="text-gray-400">|</span>
          <span className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            currentLang === 'en' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            EN
          </span>
        </div>
      </button>
      
      <div className="mt-1 text-xs text-gray-400 text-center">
        {currentLang === 'pt' 
          ? `Clique para mudar para ${nextLang.toUpperCase()}` 
          : `Click to switch to ${nextLang.toUpperCase()}`
        }
      </div>
    </div>
  );
}