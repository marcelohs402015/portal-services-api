import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  PaperAirplaneIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { serviceAPI, clientAPI, quotationAPI } from '../services/api';
import EmailQuotationModal from '../components/EmailQuotationModal';
import { QuotationItem } from '../types/api';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import EmptyState from '../components/EmptyState';
// import CustomModal from '../components/CustomModal';
// import { useCustomModal } from '../hooks/useCustomModal';

interface QuotationFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: QuotationItem[];
  discount: number;
  notes: string;
  validUntil: string;
}

const Quotations: React.FC = () => {
  const { currentTheme } = useTheme();
  // const { modalState, showError, showSuccess, showConfirm, hideModal } = useCustomModal();
  
  // Versão simplificada para evitar congelamento
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'warning',
    showCancelButton: false,
    onConfirm: null as (() => void) | null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showError = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'error',
      showCancelButton: false,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  };

  const showSuccess = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'success',
      showCancelButton: false,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Cancel'
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'warning',
      showCancelButton: true,
      onConfirm,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<any | null>(null);
  const [emailingQuotation, setEmailingQuotation] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [formData, setFormData] = useState<QuotationFormData>({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    items: [],
    discount: 0,
    notes: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: quotationsResponse, isLoading: quotationsLoading, refetch: refetchQuotations } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => quotationAPI.getQuotations(),
  });

  const { data: servicesResponse } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.getServices(),
  });

  const { data: clientsResponse } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientAPI.getClients(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: quotationAPI.createQuotation,
    onSuccess: async (data) => {
      // Invalida o cache e força refetch
      await queryClient.invalidateQueries({ queryKey: ['quotations'] });
      await refetchQuotations();
      
      resetForm();
      setIsModalOpen(false);
      showSuccess('Success', 'Quotation created successfully!');
    },
    onError: (error: any) => {
      console.error('=== QUOTATION CREATION ERROR ===');
      console.error('Error creating quotation:', error);
      showError('Error', `Failed to create quotation: ${error?.response?.data?.error || error.message || 'Unknown error'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<any>) =>
      quotationAPI.updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      resetForm();
      setIsModalOpen(false); // Fecha o modal
      showSuccess('Success', 'Quotation updated successfully!');
    },
    onError: (error: any) => {
      console.error('=== QUOTATION UPDATE ERROR ===');
      console.error('Error updating quotation:', error);
      showError('Error', `Failed to update quotation: ${error?.response?.data?.error || error.message || 'Unknown error'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotationAPI.deleteQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showSuccess('Success', 'Quotation deleted successfully!');
    },
  });

  // Email sending is handled inside EmailQuotationModal

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      items: [],
      discount: 0,
      notes: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setSelectedService('');
    setQuantity(1);
    setUnitPrice(0);
    setItemNotes('');
    setEditingQuotation(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (quotation?: any) => {
    if (quotation) {
      setEditingQuotation(quotation);
      
      // Converter services para items se necessário
      let items = quotation.items || [];
      
      if (quotation.services && !quotation.items) {
        items = quotation.services.map((service: any) => ({
          serviceId: service.id ? service.id.toString() : '',
          quantity: service.quantity || 1,
          unitPrice: parseFloat(service.price) || 0,
          subtotal: (service.quantity || 1) * (parseFloat(service.price) || 0),
          notes: service.description || undefined
        }));
      }
      
      setFormData({
        clientId: (quotation.client_id ? quotation.client_id.toString() : '') || (quotation.clientId ? quotation.clientId.toString() : '') || '',
        clientName: quotation.client_name || quotation.clientName || '',
        clientEmail: quotation.client_email || quotation.clientEmail || '',
        clientPhone: quotation.client_phone || quotation.clientPhone || '',
        clientAddress: quotation.client_address || quotation.clientAddress || '',
        items: items,
        discount: parseFloat(quotation.discount) || 0,
        notes: quotation.notes || '',
        validUntil: quotation.valid_until ? quotation.valid_until.split('T')[0] : quotation.validUntil ? quotation.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      showError('Validation Error', 'Please select a client');
      return;
    }
    
    if (formData.items.length === 0) {
      showError('Validation Error', 'Add at least one item to the quotation');
      return;
    }

    const quotationData = {
      client_id: parseInt(formData.clientId) || 0,
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      client_phone: formData.clientPhone,
      client_address: formData.clientAddress,
      services: formData.items.map(item => ({
        service_id: parseInt(item.serviceId) || 0,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0
      })),
      total: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) - formData.discount,
      discount: formData.discount,
      status: 'draft',
      valid_until: formData.validUntil,
      notes: formData.notes
    };

    // Logs removidos

    if (editingQuotation) {
      updateMutation.mutate({ id: editingQuotation.id, ...quotationData });
    } else {
      createMutation.mutate(quotationData as any);
    }
  };

  const handleDelete = (quotationId: string) => {
    showConfirm(
      'Delete Quotation',
      'Are you sure you want to delete this quotation?',
      () => deleteMutation.mutate(quotationId)
    );
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = servicesResponse?.data?.find((s: any) => s.id && serviceId && s.id.toString() === serviceId.toString());
    
    if (service) {
              setUnitPrice(parseFloat(service.price));
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clientsResponse?.data?.find((c: any) => c.id && clientId && c.id.toString() === clientId.toString());
    
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId: client.id ? client.id.toString() : '',
        clientName: client.name || '',
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        clientAddress: client.address || ''
      }));
    }
  };

  const handleAddItem = () => {
    if (!selectedService || quantity <= 0 || unitPrice <= 0) {
      showError('Validation Error', 'Please fill in all item details');
      return;
    }

    const newItem: QuotationItem = {
      serviceId: selectedService,
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
      notes: itemNotes || undefined
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedService('');
    setQuantity(1);
    setUnitPrice(0);
    setItemNotes('');
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToRemove)
    }));
  };

  const getServiceName = (serviceId: string): string => {
    const service = servicesResponse?.data?.find((s: any) => s.id && serviceId && s.id.toString() === serviceId.toString());
    return service?.name || 'Service';
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const quotations = (quotationsResponse as any)?.data || [];
  const services = (servicesResponse as any)?.data || [];
  
  // Debug removido

  if (quotationsLoading) {
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
            Quotations
          </h1>
          <p 
            className="mt-1 text-sm transition-colors duration-300"
            style={{ color: currentTheme.colors.text.muted }}
          >
            Create and manage quotations for your clients
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetchQuotations()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
            style={{ 
              backgroundColor: currentTheme.colors.background.primary,
              color: currentTheme.colors.text.primary,
              borderColor: currentTheme.colors.border.primary,
              border: '1px solid'
            }}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200"
          style={{ backgroundColor: currentTheme.colors.primary[600] }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Quotation
        </button>
        </div>
      </div>

      {/* Quotations List */}
      <div 
        className={`shadow-sm rounded-lg overflow-hidden transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        <div className="px-4 py-5 sm:p-6">
          {quotations.length === 0 ? (
            <EmptyState
              title="No quotations yet"
              description="Start creating professional quotations for your clients to grow your business."
              actionLabel="New Quotation"
              onAction={() => handleOpenModal()}
              icon="document"

            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quotations.map((quotation: any) => {
              const statusInfo = getStatusInfo(quotation.status || 'draft');
              return (
                <div
                  key={quotation.id || Math.random()}
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
                        <div className="flex items-center">
                        <DocumentTextIcon 
                            className="h-5 w-5 mr-2 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.muted }}
                        />
                        <h3 
                            className="text-sm font-medium transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {quotation.client_name || quotation.clientName || 'Unknown Client'}
                        </h3>
                        </div>
                        
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                        <div className="mt-3 space-y-1 text-xs">
                      <div 
                            className="transition-colors duration-300"
                            style={{ color: currentTheme.colors.text.muted }}
                      >
                            <strong>Email:</strong> {quotation.client_email || quotation.clientEmail || 'N/A'}
                        </div>
                          <div 
                            className="transition-colors duration-300"
                            style={{ color: currentTheme.colors.text.muted }}
                          >
                            <strong>Total:</strong> {formatPrice(quotation.total || 0)}
                        </div>
                          <div 
                            className="transition-colors duration-300"
                            style={{ color: currentTheme.colors.text.muted }}
                          >
                            Valid until: {quotation.valid_until ? format(parseISO(quotation.valid_until), 'dd/MM/yyyy', { locale: enUS }) : quotation.validUntil ? format(parseISO(quotation.validUntil), 'dd/MM/yyyy', { locale: enUS }) : 'N/A'}
                        </div>
                      <div 
                            className="transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.muted }}
                      >
                            {quotation.services?.length || quotation.items?.length || 0} {(quotation.services?.length || quotation.items?.length || 0) === 1 ? 'item' : 'items'}
                          </div>
                      </div>
                    </div>
                    
                      <div className="flex space-x-1 ml-2">
                      <button
                          onClick={() => {
                            setPreviewQuotation(quotation);
                            setIsPreviewOpen(true);
                          }}
                          className={`p-1 transition-colors duration-200 ${
                            currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                        }`}
                        style={{ color: currentTheme.colors.text.muted }}
                          title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(quotation)}
                          className={`p-1 transition-colors duration-200 ${
                          currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                        }`}
                        style={{ color: currentTheme.colors.text.muted }}
                          title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                        <button
                          onClick={() => {
                            setEmailingQuotation(quotation);
                            setIsEmailModalOpen(true);
                          }}
                          className={`p-1 transition-colors duration-200 ${
                            currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                          }`}
                          style={{ color: currentTheme.colors.text.muted }}
                          title="Send by Email"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                      <button
                        onClick={() => quotation.id && handleDelete(quotation.id)}
                          className={`p-1 transition-colors duration-200 ${
                          currentTheme.type === 'purple' ? 'darkone-hover-red' : 'hover:text-red-600'
                        }`}
                        style={{ color: currentTheme.colors.text.muted }}
                          title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 ${
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
                    {editingQuotation ? 'Edit Quotation' : 'New Quotation'}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Client Information */}
                  <div>
                    <h4 
                      className="text-md font-medium mb-3 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Client Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          Client *
                        </label>
                        <select
                          required
                          value={formData.clientId}
                          onChange={(e) => handleClientSelect(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    style={{
                      backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border.primary
                    }}
                  >
                          <option value="">Select a client</option>
                          {clientsResponse?.data?.map((client: any) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          Client Name
                        </label>
                        <input
                          type="text"
                          value={formData.clientName}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md cursor-not-allowed transition-all duration-300"
                          style={{
                            backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.muted,
                            borderColor: currentTheme.colors.border.primary,
                            opacity: 0.7
                          }}
                          placeholder="Client name"
                        />
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.clientEmail}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md cursor-not-allowed transition-all duration-300"
                          style={{
                            backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.muted,
                            borderColor: currentTheme.colors.border.primary,
                            opacity: 0.7
                          }}
                          placeholder="client@example.com"
                        />
                      </div>

                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={formData.validUntil}
                          onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.clientPhone}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md cursor-not-allowed transition-all duration-300"
                          style={{
                            backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.muted,
                            borderColor: currentTheme.colors.border.primary,
                            opacity: 0.7
                          }}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                          Address
                      </label>
                      <textarea
                        rows={2}
                        value={formData.clientAddress}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md cursor-not-allowed transition-all duration-300"
                        style={{
                            backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.muted,
                          borderColor: currentTheme.colors.border.primary,
                          opacity: 0.7
                        }}
                          placeholder="Client's complete address"
                      />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 
                      className="text-md font-medium mb-3 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Add Services
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          Service
                        </label>
                        <select
                          value={selectedService}
                          onChange={(e) => handleServiceSelect(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                          style={{
                            backgroundColor: currentTheme.colors.background.primary,
                            color: currentTheme.colors.text.primary,
                            borderColor: currentTheme.colors.border.primary
                          }}
                        >
                          <option value="">Select a service</option>
                          {services.map((service: any) => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatPrice(parseFloat(service.price))}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-1 transition-colors duration-300"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                            Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
                            Unit Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                            min="0"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
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
                          Notes
                        </label>
                      <input
                        type="text"
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                          placeholder="Additional notes for this item"
                      />
                    </div>

                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200"
                        style={{ backgroundColor: currentTheme.colors.primary[600] }}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add
                      </button>
                  </div>

                  {/* Items List */}
                  {formData.items.length > 0 && (
                      <div className="mt-6">
                        <h5 
                          className="text-sm font-medium mb-3 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                          Items ({formData.items.length})
                        </h5>
                                              <div className="space-y-2">
                          {formData.items.map((item, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 border rounded-md"
                              style={{
                                backgroundColor: currentTheme.colors.background.primary,
                                borderColor: currentTheme.colors.border.primary
                              }}
                            >
                              <div className="flex-1">
                                <div 
                                  className="font-medium transition-colors duration-300"
                                  style={{ color: currentTheme.colors.text.primary }}
                                >
                                  {getServiceName(item.serviceId)}
                                </div>
                                <div 
                                  className="text-sm transition-colors duration-300"
                                  style={{ color: currentTheme.colors.text.muted }}
                                >
                                  {item.quantity} x {formatPrice(item.unitPrice)} = {formatPrice(item.subtotal)}
                                </div>
                                {item.notes && (
                                  <div 
                                    className="text-xs transition-colors duration-300"
                                    style={{ color: currentTheme.colors.text.muted }}
                                  >
                                    {item.notes}
                                  </div>
                                )}
                              </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                                className="ml-2 p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                        </div>
                    )}
                  </div>
                </div>

                {/* Discount and Notes */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Discount ($)
                    </label>
                          <input
                            type="number"
                            step="0.01"
                      min="0"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
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
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Additional notes for the quotation..."
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
                    Cancel
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {editingQuotation ? 'Update' : 'Create'} Quotation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewQuotation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 ${
                currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
              }`}
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-medium transition-colors duration-300"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Quotation Preview
                </h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
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
                  <h4 
                    className="font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {previewQuotation.client_name || previewQuotation.clientName || 'Unknown Client'}
                  </h4>
                  <p 
                    className="text-sm transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.muted }}
                  >
                    Valid until: {previewQuotation.valid_until ? format(parseISO(previewQuotation.valid_until), 'dd/MM/yyyy', { locale: enUS }) : previewQuotation.validUntil ? format(parseISO(previewQuotation.validUntil), 'dd/MM/yyyy', { locale: enUS }) : 'N/A'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h5 
                    className="font-medium mb-2 transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Items
                  </h5>
                  <div className="space-y-2">
                    {(previewQuotation.services || previewQuotation.items)?.map((item: any, index: number) => (
                      <div key={item.id || index} className="flex justify-between text-sm">
                        <span style={{ color: currentTheme.colors.text.primary }}>
                          {item.name || item.serviceName || 'Service'} x {item.quantity || 1}
                        </span>
                        <span style={{ color: currentTheme.colors.text.primary }}>
                          {formatPrice((item.quantity || 1) * (parseFloat(item.price) || item.unitPrice || 0))}
                        </span>
                      </div>
                    )) || <div className="text-sm text-gray-500">No items</div>}
                  </div>
                </div>

                {(previewQuotation.discount ?? 0) > 0 && (
                  <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                      <span style={{ color: currentTheme.colors.text.primary }}>Discount:</span>
                      <span style={{ color: currentTheme.colors.text.primary }}>
                        -{formatPrice(previewQuotation.discount ?? 0)}
                      </span>
                  </div>
                    </div>
                  )}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span style={{ color: currentTheme.colors.text.primary }}>Total:</span>
                    <span style={{ color: currentTheme.colors.text.primary }}>
                      {formatPrice(previewQuotation.total || 0)}
                    </span>
                  </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && emailingQuotation && (
      <EmailQuotationModal
        quotation={emailingQuotation}
          isOpen={true}
        onClose={() => {
          setIsEmailModalOpen(false);
          setEmailingQuotation(null);
        }}
      />
      )}

      {/* Custom Modal Simplificado */}
      {modalState.isOpen && (
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
                  className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    modalState.type === 'error' ? 'bg-red-100' : 
                    modalState.type === 'success' ? 'bg-green-100' : 
                    modalState.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}
                >
                  {modalState.type === 'error' && (
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {modalState.type === 'success' && (
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {modalState.type === 'warning' && (
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 
                    className="text-lg leading-6 font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {modalState.title}
                  </h3>
                  <div className="mt-2">
                    <p 
                      className="text-sm transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      {modalState.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                {modalState.onConfirm && (
                  <button
                    type="button"
                    onClick={() => {
                      modalState.onConfirm?.();
                      hideModal();
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                    style={{ backgroundColor: modalState.type === 'warning' ? '#F59E0B' : '#EF4444' }}
                  >
                    {modalState.confirmText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={hideModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  {modalState.showCancelButton ? modalState.cancelText : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;