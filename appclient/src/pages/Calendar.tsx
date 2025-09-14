import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { appointmentAPI, clientAPI } from '../services/api';
import { Appointment } from '../types/api';
import { format, addDays, subDays, isSameDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';
import EmptyState from '../components/EmptyState';

interface AppointmentFormData {
  clientId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [selectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: '',
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: appointmentsResponse, isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentAPI.getAppointments(),
  });

  const { data: clientsResponse, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientAPI.getClients(),
  });

  const createMutation = useMutation({
    mutationFn: appointmentAPI.createAppointment,
    onSuccess: async () => {
      // Fechar modal do formulário
      setIsModalOpen(false);
      resetForm();
      
      // Forçar refresh dos dados
      await refetchAppointments();
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      // Mostrar modal de sucesso
      showSuccess('Agendamento criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar agendamento:', error);
      showError('Erro ao criar agendamento: ' + (error.message || 'Erro desconhecido'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<any>) => 
      appointmentAPI.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: appointmentAPI.deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const appointments = appointmentsResponse?.data || [];
  const clients = clientsResponse?.data || [];

  // Debug: Log clients data
  console.log('=== CALENDAR DEBUG ===');
  console.log('appointmentsResponse:', appointmentsResponse);
  console.log('appointmentsResponse?.data:', appointmentsResponse?.data);
  console.log('appointments array:', appointments);
  console.log('appointments length:', appointments.length);
  console.log('Clients loaded:', clients);
  console.log('Clients length:', clients.length);
  console.log('appointmentsLoading:', appointmentsLoading);
  console.log('clientsLoading:', clientsLoading);

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      notes: ''
    });
    setEditingAppointment(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (appointment?: any, date?: Date) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        clientId: appointment.client_id,
        title: appointment.notes || 'Sem título',
        description: appointment.notes || '',
        date: appointment.date,
        startTime: appointment.time,
        endTime: appointment.time,
        location: appointment.address || '',
        notes: appointment.notes || ''
      });
    } else {
      resetForm();
      if (date) {
        setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
      }
    }
    setIsModalOpen(true);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    
    // Auto-close após 3 segundos
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.clientId) {
      showError('Por favor, selecione um cliente');
      return;
    }
    
    if (!formData.title) {
      showError('Por favor, preencha o título do agendamento');
      return;
    }
    
    if (!formData.date) {
      showError('Por favor, selecione uma data');
      return;
    }
    
    if (!formData.startTime) {
      showError('Por favor, selecione o horário de início');
      return;
    }
    
    if (!formData.endTime) {
      showError('Por favor, selecione o horário de término');
      return;
    }

    // Debug: Log para verificar os dados
    console.log('Form data:', formData);
    console.log('Available clients:', clients);
    console.log('Looking for client ID:', formData.clientId, 'Type:', typeof formData.clientId);

    const selectedClient = clients.find((c: any) => c.id.toString() === formData.clientId.toString());
    console.log('Selected client:', selectedClient);
    
    if (!selectedClient) {
      showError('Cliente selecionado não encontrado. Por favor, recarregue a página e tente novamente.');
      return;
    }

    const appointmentData = {
      client_id: parseInt(formData.clientId),
      client_name: selectedClient?.name || 'Cliente Desconhecido',
      service_id: 1, // Default service for now
      date: formData.date,
      time: formData.startTime,
      duration: 60, // Default duration
      address: formData.location,
      notes: formData.notes || formData.description,
      status: 'scheduled' as const
    };

    console.log('Sending appointment data:', appointmentData);

    if (editingAppointment) {
      updateMutation.mutate({
        id: editingAppointment.id,
        ...appointmentData
      });
    } else {
      createMutation.mutate(appointmentData as any);
    }
  };

  const handleDelete = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteMutation.mutate(appointmentId as any);
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    updateMutation.mutate({
      id: appointmentId,
      status: newStatus
    });
  };

  // Removed unused getStatusColor function

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return t('calendar.status.scheduled');
      case 'confirmed': return t('calendar.status.confirmed');
      case 'in_progress': return t('calendar.status.in_progress');
      case 'completed': return t('calendar.status.completed');
      case 'cancelled': return t('calendar.status.cancelled');
      default: return status;
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Função para buscar o nome do cliente
  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : `Cliente ${clientId}`;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    console.log('=== getAppointmentsForDate DEBUG ===');
    console.log('Looking for date:', dateString);
    console.log('Available appointments:', appointments.map((apt: any) => ({
      id: apt.id,
      date: apt.date,
      dateOnly: apt.date ? apt.date.split('T')[0] : 'no-date'
    })));
    
    const filtered = appointments.filter((apt: any) => {
      if (!apt.date) return false;
      const aptDateOnly = apt.date.split('T')[0]; // Extrai apenas a parte da data
      const matches = aptDateOnly === dateString;
      console.log(`Appointment ${apt.id}: ${aptDateOnly} === ${dateString} = ${matches}`);
      return matches;
    });
    
    console.log('Filtered appointments:', filtered);
    return filtered;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
  };

  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            {t('calendar.title')}
          </h1>
          <p 
            className="mt-1 text-sm transition-colors duration-300"
            style={{ color: currentTheme.colors.text.muted }}
          >
            {t('calendar.description')}
          </p>
        </div>
        <div className="flex space-x-2">
          <div 
            className="flex rounded-lg p-1 transition-all duration-300"
            style={{ backgroundColor: currentTheme.colors.background.primary }}
          >
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'week' ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: viewMode === 'week' 
                  ? currentTheme.colors.background.card 
                  : 'transparent',
                color: viewMode === 'week' 
                  ? currentTheme.colors.text.primary 
                  : currentTheme.colors.text.muted
              }}
            >
              {t('calendar.week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'day' ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: viewMode === 'day' 
                  ? currentTheme.colors.background.card 
                  : 'transparent',
                color: viewMode === 'day' 
                  ? currentTheme.colors.text.primary 
                  : currentTheme.colors.text.muted
              }}
            >
              {t('calendar.day')}
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200"
            style={{ backgroundColor: currentTheme.colors.primary[600] }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('calendar.newAppointment')}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div 
        className={`flex items-center justify-between rounded-lg shadow-sm p-4 transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev')}
            className={`p-2 transition-colors duration-200 ${
              currentTheme.type === 'purple' ? 'darkone-hover-white' : 'hover:text-gray-600'
            }`}
            style={{ color: currentTheme.colors.text.muted }}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 
            className="text-lg font-semibold transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            {viewMode === 'week' 
              ? format(currentDate, "'Week of' MMMM d", { locale: enUS })
              : format(currentDate, "EEEE, MMMM d, yyyy", { locale: enUS })
            }
          </h2>
          <button
            onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateDay('next')}
            className={`p-2 transition-colors duration-200 ${
              currentTheme.type === 'purple' ? 'darkone-hover-white' : 'hover:text-gray-600'
            }`}
            style={{ color: currentTheme.colors.text.muted }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className={`px-3 py-1 text-sm font-medium transition-colors duration-200 ${
            currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-700'
          }`}
          style={{ color: currentTheme.colors.primary[600] }}
        >
          Hoje
        </button>
      </div>

      {/* Calendar View */}
      {appointments.length === 0 ? (
        <div 
          className={`shadow-sm rounded-lg overflow-hidden transition-all duration-300 ${
            currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
          }`}
          style={{ backgroundColor: currentTheme.colors.background.card }}
        >
          <EmptyState
            title="No appointments yet"
            description="Start scheduling appointments with your clients to manage your calendar effectively."
            actionLabel="New Appointment"
            onAction={() => handleOpenModal()}
            icon="calendar"
          />
        </div>
      ) : (
        <div 
          className={`shadow-sm rounded-lg overflow-hidden transition-all duration-300 ${
            currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
          }`}
          style={{ backgroundColor: currentTheme.colors.background.card }}
        >
        {viewMode === 'week' ? (
          <div 
            className="grid grid-cols-7 gap-px transition-all duration-300"
            style={{ backgroundColor: currentTheme.colors.border.primary }}
          >
            {getWeekDays().map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={index} 
                  className="min-h-[200px] transition-all duration-300"
                  style={{ backgroundColor: currentTheme.colors.background.primary }}
                >
                  <div 
                    className={`p-2 text-center border-b transition-all duration-300 ${
                      isToday ? '' : ''
                    }`}
                    style={{
                      backgroundColor: isToday 
                        ? currentTheme.colors.primary[600] 
                        : currentTheme.colors.background.primary,
                      color: isToday 
                        ? '#ffffff' 
                        : currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border.primary
                    }}
                  >
                    <div className="text-xs font-medium">
                      {format(day, 'EEE', { locale: enUS })}
                    </div>
                    <div 
                      className={`text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mx-auto mt-1 transition-all duration-300 ${
                        isToday ? '' : ''
                      }`}
                      style={{
                        backgroundColor: isToday 
                          ? '#ffffff' 
                          : 'transparent',
                        color: isToday 
                          ? currentTheme.colors.primary[600] 
                          : currentTheme.colors.text.primary
                      }}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    {dayAppointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="text-xs p-2 rounded transition-all duration-200 group"
                        style={{
                          backgroundColor: currentTheme.colors.primary[600],
                          borderColor: currentTheme.colors.primary[600],
                          border: '1px solid'
                        }}
                      >
                        <div 
                          className="font-medium truncate transition-colors duration-300 cursor-pointer"
                          style={{ color: '#ffffff' }}
                          onClick={() => handleOpenModal(appointment)}
                        >
                          {appointment.time} - {appointment.notes || 'Sem título'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div 
                            className="truncate transition-colors duration-300 cursor-pointer flex-1"
                            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                            onClick={() => handleOpenModal(appointment)}
                          >
                            {getClientName(appointment.client_id)}
                          </div>
                          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(appointment);
                              }}
                              className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                              title="Editar"
                            >
                              <PencilIcon className="h-3 w-3 text-white" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(appointment.id);
                              }}
                              className="p-1 hover:bg-red-500/30 rounded transition-colors duration-200"
                              title="Excluir"
                            >
                              <TrashIcon className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleOpenModal(undefined, day)}
                      className={`w-full text-xs py-1 border-2 border-dashed rounded transition-all duration-200 ${
                        currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                      }`}
                      style={{
                        color: currentTheme.colors.text.muted,
                        borderColor: currentTheme.colors.border.primary
                      }}
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {getAppointmentsForDate(currentDate).map((appointment: any) => (
                <div
                  key={appointment.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
                    currentTheme.type === 'purple' ? 'darkone-glass' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background.primary,
                    borderColor: currentTheme.colors.border.primary
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="flex items-center text-sm transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.muted }}
                        >
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.time} - {appointment.time}
                        </div>
                        <span 
                          className="inline-block px-2 py-1 text-xs font-medium rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: currentTheme.colors.primary[600],
                            color: '#ffffff'
                          }}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      
                      <h3 
                        className="text-lg font-medium mt-2 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        {appointment.notes || 'Sem título'}
                      </h3>
                      
                      <div 
                        className="flex items-center text-sm mt-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.muted }}
                      >
                        <UserIcon className="h-4 w-4 mr-1" />
                        {getClientName(appointment.client_id)}
                      </div>
                      
                      {appointment.address && (
                        <div 
                          className="flex items-center text-sm mt-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.muted }}
                        >
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {appointment.address}
                        </div>
                      )}
                      
                      {appointment.notes && (
                        <p 
                          className="text-sm mt-2 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.muted }}
                        >
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="px-2 py-1 text-xs rounded transition-all duration-200"
                          style={{
                            backgroundColor: currentTheme.colors.primary[600],
                            color: '#ffffff'
                          }}
                        >
                          Confirmar
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-2 py-1 text-xs rounded transition-all duration-200"
                          style={{
                            backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.primary,
                            borderColor: currentTheme.colors.border.primary,
                            border: '1px solid'
                          }}
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(appointment)}
                        className={`p-1 transition-colors duration-200 ${
                          currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                        }`}
                        style={{ color: currentTheme.colors.text.muted }}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className={`p-1 transition-colors duration-200 ${
                          currentTheme.type === 'purple' ? 'darkone-hover-red' : 'hover:text-red-600'
                        }`}
                        style={{ color: currentTheme.colors.text.muted }}
                        title="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {getAppointmentsForDate(currentDate).length === 0 && (
                <div className="text-center py-12">
                  <CalendarDaysIcon 
                    className="mx-auto h-12 w-12 transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.muted }}
                  />
                  <h3 
                    className="mt-2 text-sm font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    No appointments
                  </h3>
                  <p 
                    className="mt-1 text-sm transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.muted }}
                  >
                    No appointments for this day.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => handleOpenModal(undefined, currentDate)}
                      className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200"
                      style={{ backgroundColor: currentTheme.colors.primary[600] }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Criar Agendamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
                currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
              }`}
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-lg font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`transition-colors duration-200 ${
                      currentTheme.type === 'purple' ? 'darkone-hover-white' : 'hover:text-gray-600'
                    }`}
                    style={{ color: currentTheme.colors.text.muted }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Cliente *
                    </label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      disabled={clientsLoading}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                    >
                      <option value="">
                        {clientsLoading ? 'Carregando clientes...' : 'Selecione um cliente'}
                      </option>
                      {clientsLoading ? (
                        <option value="" disabled>Carregando...</option>
                      ) : clients.length === 0 ? (
                        <option value="" disabled>Nenhum cliente encontrado</option>
                      ) : (
                        clients.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </option>
                        ))
                      )}
                    </select>
                    {!clientsLoading && clients.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Nenhum cliente encontrado. <a href="/clients" className="underline">Cadastre um cliente primeiro</a>
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Appointment title"
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        End Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Local
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Address or service location"
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Service or appointment description"
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Internal notes"
                    />
                  </div>
                </div>

                <div 
                  className="flex justify-end space-x-3 mt-6 pt-4 border-t transition-all duration-300"
                  style={{ borderColor: currentTheme.colors.border.primary }}
                >
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
                    style={{
                      backgroundColor: currentTheme.colors.background.primary,
                      color: currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border.primary,
                      border: '1px solid'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-all duration-200"
                    style={{ backgroundColor: currentTheme.colors.primary[600] }}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {createMutation.isPending ? 'Criando...' : 'Atualizando...'}
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {editingAppointment ? 'Atualizar' : 'Criar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6 ${
                currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
              }`}
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              <div className="sm:flex sm:items-start">
                <div 
                  className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 
                    className="text-lg leading-6 font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Erro
                  </h3>
                  <div className="mt-2">
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6 ${
                currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
              }`}
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              <div className="sm:flex sm:items-start">
                <div 
                  className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 
                    className="text-lg leading-6 font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Sucesso!
                  </h3>
                  <div className="mt-2">
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  style={{ backgroundColor: '#10B981' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;