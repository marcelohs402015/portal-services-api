import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from './ThemeSelector';
import ContactModal from './ContactModal';
import PortalServicesLogo from './FlowIALogo';
import { 
  EnvelopeIcon, 
  ChartBarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarDaysIcon,
  Bars3Icon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  type?: 'section';
}

const getNavigation = (t: any, themeType: string): NavigationItem[] => {
  return [
    { name: t('navigation.dashboard'), href: '/', icon: ChartBarIcon },
    { name: t('navigation.emails'), href: '/emails', icon: EnvelopeIcon },
    { name: t('navigation.categories'), href: '/categories', icon: TagIcon },
    { name: t('navigation.services'), href: '/services', icon: WrenchScrewdriverIcon },
    { name: t('navigation.quotations'), href: '/quotations', icon: DocumentTextIcon },
    { name: t('navigation.clients'), href: '/clients', icon: UsersIcon },
    { name: t('navigation.calendar'), href: '/calendar', icon: CalendarDaysIcon },
  ];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  
  // Fallback para garantir que sempre temos um tema válido
  const safeTheme = currentTheme || {
    type: 'light',
    colors: {
      primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
      background: { primary: '#f8fafc', secondary: '#ffffff', sidebar: '#ffffff', card: '#ffffff' },
      text: { primary: '#1e293b', secondary: '#475569', muted: '#64748b' },
      border: { primary: '#e2e8f0', secondary: '#f1f5f9' }
    }
  };
  
  const navigation = getNavigation(t, safeTheme.type);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
          <div 
        className="flex h-screen transition-all duration-300"
        style={{ backgroundColor: safeTheme.colors.background.primary }}
      >
      {/* Sidebar */}
      <div className={classNames(
        "flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative z-10",
        isCollapsed ? "w-16" : "w-64"
      )}
              style={{ backgroundColor: safeTheme.colors.background.sidebar }}
      >
        {/* Logo and Toggle */}
        <div 
          className="flex items-center h-16 px-2"
          style={{ backgroundColor: safeTheme.colors.primary[600] }}
        >
          {isCollapsed ? (
            /* Collapsed Layout - Logo and Toggle side by side */
            <>
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-2 py-2 rounded-lg shadow-lg border border-blue-700/30 flex-1">
                <PortalServicesLogo 
                  width={32} 
                  height={32} 
                  showText={true} 
                  variant="dark" 
                  showTagline={false}
                  isCollapsed={true}
                />
              </div>
              <button
                onClick={() => setIsCollapsed(false)}
                className="flex items-center justify-center p-1.5 rounded-md text-white hover:bg-white/20 transition-colors duration-200 ml-1"
                title={t('sidebar.expand') || 'Expand sidebar'}
              >
                <Bars3Icon className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Expanded Layout - Logo and Toggle with proper spacing */
            <>
              <div className="flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-3 py-2 rounded-lg shadow-lg border border-blue-700/30 flex-1 mx-2">
                <PortalServicesLogo 
                  width={120} 
                  height={44} 
                  showText={true} 
                  variant="dark" 
                  showTagline={true}
                  isCollapsed={false}
                />
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center justify-center p-2 rounded-md text-white hover:bg-white/20 transition-colors duration-200 ml-2"
                title={t('sidebar.collapse') || 'Collapse sidebar'}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={classNames(
          "flex-1 py-6 space-y-2",
          isCollapsed ? "px-2" : "px-4"
        )}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const isLightTheme = safeTheme.type === 'light';
            
            return (
              <Link
                key={item.name}
                to={item.href || '#'}
                className={classNames(
                  isActive
                    ? isLightTheme 
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'bg-white/10 text-white border-r-2'
                    : isLightTheme
                      ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  'group flex items-center text-sm font-medium rounded-lg transition-all duration-150 relative',
                  isCollapsed 
                    ? 'px-2 py-3 justify-center mx-1' 
                    : 'px-3 py-2'
                )}
                style={{
                  borderRightColor: isActive 
                    ? (isLightTheme ? safeTheme.colors.primary[500] : safeTheme.colors.primary[400])
                    : 'transparent'
                }}
                title={isCollapsed ? item.name : ''}
              >
                {item.icon && (
                  <item.icon
                    className={classNames(
                      isActive 
                        ? (isLightTheme ? 'text-primary-500' : 'text-white')
                        : (isLightTheme ? 'text-gray-400 group-hover:text-gray-500' : 'text-white/60 group-hover:text-white'),
                      'h-5 w-5 flex-shrink-0 transition-colors duration-150',
                      isCollapsed ? '' : 'mr-3'
                    )}
                    aria-hidden="true"
                  />
                )}
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="transition-opacity duration-300">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full"
                        style={{ 
                          backgroundColor: isLightTheme ? safeTheme.colors.primary[500] : safeTheme.colors.primary[500],
                          color: 'white'
                        }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-4 text-xs border-t transition-opacity duration-300"
            style={{ 
              borderColor: safeTheme.type === 'light' ? safeTheme.colors.border.primary : 'rgba(255,255,255,0.1)',
              color: safeTheme.type === 'light' ? safeTheme.colors.text.muted : 'rgba(255,255,255,0.6)'
            }}>
            <p>{t('app.name')} {t('app.version')}</p>
            <div className="flex items-center space-x-2">
              <p>{t('app.copyright')}</p>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="p-1 rounded transition-colors duration-200 hover:bg-white/10"
                title="Contact Information"
              >
                <EnvelopeIcon className="w-4 h-4" />
              </button>
            </div>
            <p>{t('app.rights')}</p>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header 
          className="shadow-sm border-b transition-all duration-300"
          style={{ 
            backgroundColor: safeTheme.colors.background.secondary,
            borderColor: safeTheme.colors.border.primary 
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 
              className="text-2xl font-semibold transition-colors duration-300"
              style={{ color: currentTheme.colors.text.primary }}
            >
              {navigation.find(item => item.href === location.pathname)?.name || t('navigation.dashboard')}
            </h1>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: safeTheme.colors.text.muted }} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-300 border"
                  style={{
                    backgroundColor: safeTheme.type === 'light' ? 'white' : safeTheme.colors.background.primary,
                    color: safeTheme.colors.text.primary,
                    borderColor: safeTheme.colors.border.secondary
                  }}
                />
              </div>

              {/* Theme Selector */}
              <ThemeSelector />

              

              {/* Notifications */}
              <button className="relative p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                style={{ 
                  backgroundColor: 'transparent',
                  '--tw-bg-opacity': safeTheme.type === 'light' ? '0' : '0.1'
                } as React.CSSProperties}>
                <BellIcon className="w-5 h-5" style={{ color: safeTheme.colors.text.primary }} />
                <span className="absolute -top-1 -right-1 w-4 h-4 text-xs font-bold text-white rounded-full flex items-center justify-center"
                  style={{ backgroundColor: safeTheme.colors.primary[500] }}>
                  5
                </span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium transition-colors duration-300"
                    style={{ color: safeTheme.colors.text.primary }}>
                    Marcelo Hernandes
                  </p>
                  <p className="text-xs transition-colors duration-300"
                    style={{ color: safeTheme.colors.text.muted }}>
                    Portal Services
                  </p>
                </div>
                <UserCircleIcon className="w-8 h-8" style={{ color: safeTheme.colors.text.primary }} />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main 
          className="flex-1 overflow-y-auto p-6 transition-all duration-300"
          style={{ backgroundColor: safeTheme.colors.background.primary }}
        >
          <Outlet />
        </main>
      </div>
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
}