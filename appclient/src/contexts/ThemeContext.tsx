import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'light' | 'purple';

export interface Theme {
  name: string;
  type: ThemeType;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    background: {
      primary: string;
      secondary: string;
      sidebar: string;
      card: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
  };
}

export const themes: Record<ThemeType, Theme> = {
  light: {
    name: 'Light',
    type: 'light',
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      background: {
        primary: '#fafbfc',
        secondary: '#ffffff',
        sidebar: '#f8fafc',
        card: '#ffffff',
      },
      text: {
        primary: '#1f2937',
        secondary: '#4b5563',
        muted: '#6b7280',
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#f3f4f6',
      },
    },
  },
  purple: {
    name: 'Dark',
    type: 'purple',
    colors: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      background: {
        primary: '#0f0a1a',
        secondary: '#1a1625',
        sidebar: '#1a1625',
        card: '#1e1b2e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e2e8f0',
        muted: '#94a3b8',
      },
      border: {
        primary: '#374151',
        secondary: '#4b5563',
      },
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: ThemeType) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeType, setCurrentThemeType] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    const validTheme = saved as ThemeType;
    return validTheme && themes[validTheme] ? validTheme : 'light';
  });

  const currentTheme = themes[currentThemeType] || themes.light;
  const availableThemes = Object.values(themes);

  const setTheme = (themeType: ThemeType) => {
    if (themes[themeType]) {
      setCurrentThemeType(themeType);
      localStorage.setItem('theme', themeType);
    }
  };

  useEffect(() => {
    // Apply theme to document root for CSS custom properties
    const root = document.documentElement;
    
    // Set CSS custom properties for the current theme
    Object.entries(currentTheme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-background-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};
