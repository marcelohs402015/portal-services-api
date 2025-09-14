import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { emailAPI } from '../services/api';
import { FilterOptions, PaginationOptions } from '../types/api';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import EmptyState from '../components/EmptyState';

export default function EmailList() {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'DESC'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: emailsData, isLoading, error, refetch } = useQuery({
    queryKey: ['emails', filters, pagination],
    queryFn: () => emailAPI.getEmails(filters, pagination),
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      from: searchTerm || undefined
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getCategoryLabel = (category: string) => {
    return t(`emails.categories.${category}`);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      complaint: 'bg-red-100 text-red-800 border-red-200',
      quote: 'bg-blue-100 text-blue-800 border-blue-200',
      product_info: 'bg-green-100 text-green-800 border-green-200',
      support: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sales: 'bg-purple-100 text-purple-800 border-purple-200',
      sem_categoria: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">{t('emails.loadingError')}</h3>
          <p className="text-red-600 mt-2">{t('emails.serverCheck')}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('emails.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const emails = emailsData?.data?.items || [];
  const paginationInfo = emailsData?.data;

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div 
        className={`rounded-lg shadow p-6 transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-lg font-semibold transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            {t('emails.title')}
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-200 ${
              currentTheme.type === 'purple' ? 'darkone-hover-white' : 'hover:text-gray-900'
            }`}
            style={{ 
              color: currentTheme.colors.text.secondary
            }}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>{t('emails.filters')}</span>
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300"
              style={{ color: currentTheme.colors.text.muted }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('emails.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border rounded-md transition-all duration-300"
              style={{
                backgroundColor: currentTheme.colors.background.primary,
                color: currentTheme.colors.text.primary,
                borderColor: currentTheme.colors.border.primary
              }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-md transition-colors duration-200"
            style={{ backgroundColor: currentTheme.colors.primary[600] }}
          >
            {t('emails.search')}
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md transition-all duration-300"
            style={{ backgroundColor: currentTheme.colors.background.primary }}
          >
            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: currentTheme.colors.text.primary }}
              >
                {t('emails.headers.category')}
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-md transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.colors.background.primary,
                  color: currentTheme.colors.text.primary,
                  borderColor: currentTheme.colors.border.primary
                }}
              >
                <option value="">{t('emails.allCategories')}</option>
                {Object.keys({complaint: '', quote: '', product_info: '', support: '', sales: '', uncategorized: ''}).map((key) => (
                  <option key={key} value={key}>{getCategoryLabel(key)}</option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: currentTheme.colors.text.primary }}
              >
                {t('emails.headers.status')}
              </label>
              <select
                value={filters.responded === true ? 'true' : filters.responded === false ? 'false' : ''}
                onChange={(e) => handleFilterChange('responded', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.colors.background.primary,
                  color: currentTheme.colors.text.primary,
                  borderColor: currentTheme.colors.border.primary
                }}
              >
                <option value="">{t('emails.allStatuses')}</option>
                <option value="false">{t('emails.pending')}</option>
                <option value="true">{t('emails.responded')}</option>
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: currentTheme.colors.text.primary }}
              >
                {t('emails.headers.date')}
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.colors.background.primary,
                  color: currentTheme.colors.text.primary,
                  borderColor: currentTheme.colors.border.primary
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Email List */}
      <div 
        className={`rounded-lg shadow overflow-hidden transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        {emails.length === 0 ? (
          <EmptyState
            title="No emails found"
            description="No emails available. Emails will appear here when the API returns data."
            icon="mail"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead 
                  className="transition-all duration-300"
                  style={{ backgroundColor: currentTheme.colors.background.primary }}
                >
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.status')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.subject')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.sender')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.category')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.date')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {t('emails.headers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody 
                  className="divide-y transition-all duration-300"
                  style={{ 
                    backgroundColor: currentTheme.colors.background.card,
                    borderColor: currentTheme.colors.border.primary
                  }}
                >
                  {emails.map((email) => (
                    <tr 
                      key={email.id} 
                      className={`transition-all duration-200 ${
                        currentTheme.type === 'purple' ? 'hover:bg-opacity-10 hover:bg-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {email.responded ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="text-sm font-medium truncate max-w-xs transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {email.subject}
                        </div>
                        <div 
                          className="text-sm truncate max-w-xs transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.muted }}
                        >
                          {email.snippet}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm truncate max-w-xs transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {email.from}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(email.category)}`}>
                          {getCategoryLabel(email.category)}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.muted }}
                      >
                        {format(parseISO(email.date), 'dd/MM/yyyy HH:mm', { locale: enUS })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/emails/${email.id}`}
                          className={`flex items-center space-x-1 transition-colors duration-200 ${
                            currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-900'
                          }`}
                          style={{ color: currentTheme.colors.primary[600] }}
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>{t('emails.view')}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <div 
                className="px-4 py-3 flex items-center justify-between border-t sm:px-6 transition-all duration-300"
                style={{ 
                  backgroundColor: currentTheme.colors.background.card,
                  borderColor: currentTheme.colors.border.primary
                }}
              >
                                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                    >
                      {t('emails.previous')}
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= paginationInfo.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                    >
                      {t('emails.next')}
                    </button>
                  </div>
                                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p 
                        className="text-sm transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.secondary }}
                      >
                        {t('emails.showing')}{' '}
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {((pagination.page - 1) * pagination.limit) + 1}
                        </span>{' '}
                        {t('emails.to')}{' '}
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {Math.min(pagination.page * pagination.limit, paginationInfo.total)}
                        </span>{' '}
                        {t('emails.of')}{' '}
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {paginationInfo.total}
                        </span> {t('emails.results')}
                      </p>
                    </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.muted,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      >
                        {t('emails.previous')}
                      </button>
                      
                      {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (paginationInfo.totalPages > 5 && pagination.page > 3) {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                              pageNum === pagination.page
                                ? 'z-10'
                                : ''
                            }`}
                            style={{
                              backgroundColor: pageNum === pagination.page 
                                ? currentTheme.colors.primary[600] 
                                : currentTheme.colors.background.primary,
                              color: pageNum === pagination.page 
                                ? '#ffffff' 
                                : currentTheme.colors.text.muted,
                              borderColor: pageNum === pagination.page 
                                ? currentTheme.colors.primary[600] 
                                : currentTheme.colors.border.primary
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= paginationInfo.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.muted,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      >
                        {t('emails.next')}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}