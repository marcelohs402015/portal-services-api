import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { emailAPI } from '../services/api';
import { Quotation } from '../types/api';
import { 
  DocumentTextIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface QuotationSelectorProps {
  selectedQuotationId?: string;
  onSelect: (quotation: Quotation | null) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QuotationSelector({ 
  selectedQuotationId, 
  onSelect, 
  onClose, 
  isOpen 
}: QuotationSelectorProps) {
  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => emailAPI.getQuotations(),
    enabled: isOpen,
  });

  const quotations = quotationsData?.data || [];

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XMarkIcon className="h-4 w-4 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      sent: 'Sent',
      accepted: 'Accepted',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Select Quotation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quotations found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first quotation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <button
                  onClick={() => onSelect(null)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    !selectedQuotationId
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-700">No Attachment</span>
                  </div>
                </button>
              </div>

              {quotations.map((quotation) => (
                <button
                  key={quotation.id}
                  onClick={() => onSelect(quotation)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedQuotationId === quotation.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(quotation.status)}
                        <h4 className="font-medium text-gray-900">
                          Quotation for {quotation.clientName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                          {getStatusLabel(quotation.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Client:</strong> {quotation.clientEmail}</p>
                        <p><strong>Total:</strong> {formatCurrency(quotation.total)}</p>
                        <p><strong>Items:</strong> {quotation.items.length} services</p>
                        <p><strong>Created:</strong> {
                          format(parseISO(quotation.created_at), 'dd/MM/yyyy', { locale: enUS })
                        }</p>
                        {quotation.validUntil && (
                          <p><strong>Valid Until:</strong> {
                            format(parseISO(quotation.validUntil), 'dd/MM/yyyy', { locale: enUS })
                          }</p>
                        )}
                        {quotation.notes && (
                          <p><strong>Notes:</strong> {quotation.notes}</p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {quotation.items.slice(0, 3).map((item, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {item.quantity}x {item.notes || 'Service'}
                          </span>
                        ))}
                        {quotation.items.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{quotation.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedQuotationId === quotation.id && (
                      <CheckIcon className="h-6 w-6 text-primary-600 ml-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}