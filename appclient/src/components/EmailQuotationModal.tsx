import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailAPI, quotationAPI } from '../services/api';
import { Quotation } from '../types/api';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  AtSymbolIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import CustomModal from './CustomModal';
import { useCustomModal } from '../hooks/useCustomModal';

interface EmailQuotationModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailQuotationModal({ quotation, isOpen, onClose }: EmailQuotationModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const { modalState, showError, showSuccess, hideModal } = useCustomModal();

  const sendMutation = useMutation({
    mutationFn: ({ quotationId, email }: { quotationId: string; email: string }) =>
      quotationAPI.sendQuotation(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      showSuccess('Success', 'Quotation sent successfully!');
      onClose();
      resetForm();
    },
    onError: () => {
      showError('Error', 'Error sending quotation. Please try again.');
    },
  });

  const resetForm = () => {
    setRecipientEmail('');
    setSubject('');
    setMessage('');
  };

  React.useEffect(() => {
    if (quotation && isOpen) {
      setRecipientEmail(quotation.clientEmail || '');
      setSubject(`Quotation for ${quotation.clientName}`);
      setMessage(
        `Hello ${quotation.clientName},\n\n` +
        `Attached is your quotation. Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quotation.total)}.\n` +
        (quotation.validUntil ? `Valid until: ${format(parseISO(quotation.validUntil), 'dd/MM/yyyy', { locale: enUS })}.\n` : '') +
        `\nBest regards,\nPortal Services`
      );
    }
  }, [quotation, isOpen]);

  const handleSend = () => {
    if (!quotation || !recipientEmail.trim()) {
      showError('Validation Error', 'Please fill recipient email');
      return;
    }

    if (!recipientEmail.includes('@')) {
      showError('Validation Error', 'Please provide a valid email');
      return;
    }

    sendMutation.mutate({
      quotationId: quotation.id,
      email: recipientEmail.trim()
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  if (!isOpen || !quotation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Send Quotation by Email</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Quotation Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Summary
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Client:</strong> {quotation.clientName}</p>
              <p><strong>Total:</strong> {formatCurrency(quotation.total)}</p>
              <p><strong>Items:</strong> {quotation.items.length} services</p>
              {quotation.validUntil && (
                <p><strong>Valid until:</strong> {
                  format(parseISO(quotation.validUntil), 'dd/MM/yyyy', { locale: enUS })
                }</p>
              )}
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            {/* Recipient Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AtSymbolIcon className="h-4 w-4 inline mr-1" />
                Recipient Email *
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={'client@example.com'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={'Quotation for services'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder={'Message to client...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Personalize your message before sending.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sendMutation.isPending || !recipientEmail.trim() || !subject.trim() || !message.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
            <span>
              {sendMutation.isPending ? 'Sending...' : 'Send Quotation'}
            </span>
          </button>
        </div>
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showCancelButton={modalState.showCancelButton}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}