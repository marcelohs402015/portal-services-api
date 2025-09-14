import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import { emailAPI } from '../services/api';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function BusinessStats() {
  const { currentTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const { data: businessStats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['businessStats'],
    queryFn: emailAPI.getBusinessStats,
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não manter em cache (cacheTime foi renomeado para gcTime)
  });

  const { data: revenueStats } = useQuery({
    queryKey: ['revenueStats', selectedPeriod],
    queryFn: () => emailAPI.getRevenueStats(selectedPeriod),
  });

  const { data: appointmentStats } = useQuery({
    queryKey: ['appointmentStats'],
    queryFn: emailAPI.getAppointmentStats,
  });

  const { data: clientStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: emailAPI.getClientStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderColor: currentTheme.colors.primary[600] }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Erro ao carregar estatísticas: {String(error)}</p>
      </div>
    );
  }

  const stats = businessStats?.data;
  const revenue = revenueStats?.data || [];
  const appointments = appointmentStats?.data;
  const clients = clientStats?.data;
  
  if (!stats || !businessStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma estatística disponível</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className={`h-8 w-8 ${
            currentTheme.type === 'purple' ? 'text-purple-400' : 'text-primary-600'
          }`} />
          <h2 className={`text-2xl font-bold ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Estatísticas do Negócio</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-2 rounded-md border transition-colors duration-300 hover:opacity-80 disabled:opacity-50 ${
              currentTheme.type === 'purple' 
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                : 'light-glass border-gray-300 text-gray-900 shadow-light-soft hover:bg-gray-50'
            }`}
            title="Atualizar estatísticas"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-3 py-2 rounded-md border transition-colors duration-300 ${
              currentTheme.type === 'purple' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'light-glass border-gray-300 text-gray-900 shadow-light-soft'
            }`}
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card-financial'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Receita Total</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(stats?.overview?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-soft'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Clientes</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.overview?.totalClients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-soft'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Agendamentos</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.overview?.totalAppointments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card-financial shadow-light-soft'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Cotações</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.overview?.totalQuotations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-soft'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Serviços</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.overview?.totalServices || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-4 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-soft'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIcon className="h-8 w-8 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className={`text-xs font-medium ${
                currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-500'
              }`}>Emails</p>
              <p className={`text-lg font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.overview?.totalEmails || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Quotations Breakdown */}
        <div className={`rounded-lg shadow p-6 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card-financial shadow-light-medium'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Status das Cotações</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Pendentes
              </span>
              <span className={`font-semibold ${
                currentTheme.type === 'purple' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {stats?.quotations?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Aceitas
              </span>
              <span className="font-semibold text-green-600">
                {stats?.quotations?.accepted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Rejeitadas
              </span>
              <span className="font-semibold text-red-600">
                {stats?.quotations?.rejected || 0}
              </span>
            </div>
            <div className={`pt-2 mt-3 border-t ${
              currentTheme.type === 'purple' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                  Receita Total
                </span>
                <span className={`font-semibold text-green-600`}>
                  {formatCurrency(stats?.quotations?.totalRevenue || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Status */}
        <div className={`rounded-lg shadow p-6 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-medium'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Status dos Agendamentos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Agendados
              </span>
              <span className={`font-semibold ${
                currentTheme.type === 'purple' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {stats?.appointments?.scheduled || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Confirmados
              </span>
              <span className="font-semibold text-green-600">
                {stats?.appointments?.confirmed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Concluídos
              </span>
              <span className="font-semibold text-purple-600">
                {stats?.appointments?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Cancelados
              </span>
              <span className="font-semibold text-red-600">
                {stats?.appointments?.cancelled || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Email Statistics */}
        <div className={`rounded-lg shadow p-6 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card shadow-light-medium'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Estatísticas de Email</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Total
              </span>
              <span className={`font-semibold ${
                currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats?.emails?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Processados
              </span>
              <span className="font-semibold text-blue-600">
                {stats?.emails?.processed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                Respondidos
              </span>
              <span className="font-semibold text-green-600">
                {stats?.emails?.responded || 0}
              </span>
            </div>
            <div className={`pt-2 mt-3 border-t ${
              currentTheme.type === 'purple' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                  Taxa de Resposta
                </span>
                <span className={`font-semibold text-green-600`}>
                  {stats?.emails?.responseRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className={`rounded-lg shadow p-6 lg:col-span-2 xl:col-span-3 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card-financial shadow-light-medium'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Categorias de Serviço por Receita</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.categoryStats && stats.categoryStats.slice(0, 6).map((category: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg ${
                currentTheme.type === 'purple' ? 'bg-gray-800' : 'bg-gray-50 shadow-light-soft'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${
                      currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.category}
                    </p>
                    <p className={`text-sm ${
                      currentTheme.type === 'purple' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {category.service_count} serviços
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(category.total_revenue || 0)}
                    </p>
                    <p className={`text-sm ${
                      currentTheme.type === 'purple' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {category.quotations_count} cotações
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className={`rounded-lg shadow p-6 lg:col-span-2 xl:col-span-3 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'light-card-financial shadow-light-medium'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
          }`}>Tendência de Receita ({selectedPeriod === 'monthly' ? 'Mensal' : selectedPeriod === 'weekly' ? 'Semanal' : selectedPeriod === 'daily' ? 'Diária' : 'Anual'})</h3>
          <div className="space-y-3">
            {revenue && revenue.slice(-6).map((period: any, index: number) => (
              <div key={index} className={`flex justify-between items-center py-2 px-3 rounded ${
                currentTheme.type === 'purple' ? 'bg-gray-800' : 'bg-gray-50 shadow-light-soft'
              }`}>
                <span className={currentTheme.type === 'purple' ? 'text-gray-300' : 'text-gray-600'}>
                  {new Date(period.period).toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    year: selectedPeriod === 'yearly' ? 'numeric' : '2-digit',
                    day: selectedPeriod === 'daily' ? 'numeric' : undefined
                  })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className={`font-semibold ${
                      currentTheme.type === 'purple' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(period.revenue || 0)}
                    </span>
                    <span className={`text-sm ml-2 ${
                      currentTheme.type === 'purple' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      ({period.quotations_count || 0} cotações)
                    </span>
                  </div>
                  {period.growth_rate !== undefined && getGrowthIcon(period.growth_rate)}
                  {period.growth_rate !== undefined && (
                    <span className={`text-sm font-medium ${
                      period.growth_rate > 0 ? 'text-green-500' : 
                      period.growth_rate < 0 ? 'text-red-500' : 
                      currentTheme.type === 'purple' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {period.growth_rate > 0 ? '+' : ''}{period.growth_rate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}