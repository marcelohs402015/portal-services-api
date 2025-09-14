import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { emailAPI } from '../services/api';
import QuotationSelector from '../components/QuotationSelector';
import { Quotation } from '../types/api';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function EmailDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showQuotationSelector, setShowQuotationSelector] = useState(false);

  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryKey: ['email', id],
    queryFn: () => emailAPI.getEmailById(parseInt(id!)),
    enabled: !!id,
  });

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => emailAPI.getTemplates(),
  });

  const replyMutation = useMutation({
    mutationFn: ({ emailId, templateId, message, quotationId }: { 
      emailId: string; 
      templateId?: string; 
      message?: string; 
      quotationId?: string; 
    }) => emailAPI.replyToEmail(parseInt(emailId), templateId!, message),
    onSuccess: () => {
      // Refresh email data and emails list
      queryClient.invalidateQueries({ queryKey: ['email', id] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      
      setShowReplyForm(false);
      setSelectedTemplate('');
      setCustomMessage('');
      setSelectedQuotation(null);
      alert('Resposta enviada com sucesso!');
    },
    onError: (error) => {
      console.error('Failed to send reply:', error);
      alert('Falha ao enviar resposta. Tente novamente.');
    },
  });

  const handleReply = () => {
    if (!id) return;

    if (!selectedTemplate && !customMessage.trim()) {
      alert('Selecione um template ou escreva uma mensagem personalizada.');
      return;
    }

    replyMutation.mutate({
      emailId: id,
      templateId: selectedTemplate || undefined,
      message: customMessage.trim() || undefined,
      quotationId: selectedQuotation?.id || undefined,
    });
  };

  if (emailLoading || !id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const email = emailData?.data;
  const templates = templatesData?.data || [];

  if (!email) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">{t('emails.detail.emailNotFound')}</h3>
        <button
          onClick={() => navigate('/emails')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {t('buttons.backToList')}
        </button>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    return t(`emails.categories.${category}`);
  };

  const getTemplatePreview = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';
    
    let preview = template.body;
    
    // Replace common variables
    preview = preview.replace(/\${subject}/g, email.subject);
    preview = preview.replace(/\${protocol}/g, `PROT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    
    return preview;
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/emails')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>{t('buttons.back')}</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t('emails.detail.title')}</h1>
      </div>

      {/* Email Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Email Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {email.subject}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span><strong>{t('emails.detail.from')}</strong> {email.from}</span>
                <span><strong>{t('emails.detail.date')}</strong> {format(parseISO(email.date), 'dd/MM/yyyy HH:mm', { locale: enUS })}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(email.category)}`}>
                  {getCategoryLabel(email.category)}
                </span>
                <div className="flex items-center space-x-2">
                  {email.responded ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{t('emails.detail.responded')}</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">{t('emails.detail.pending')}</span>
                    </>
                  )}
                </div>
                {email.confidence && (
                  <span className="text-sm text-gray-500">
                    {t('emails.detail.confidence')}: {Math.round(email.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
            {!email.responded && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>{t('emails.detail.reply')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">{t('emails.detail.content')}</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {email.body || email.snippet}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('emails.detail.replyTitle')}</h3>
          
          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('emails.detail.selectTemplate')}
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('emails.detail.templatePlaceholder')}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.category && `(${getCategoryLabel(template.category)})`}
                </option>
              ))}
            </select>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('emails.detail.templatePreview')}
              </label>
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </span>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {getTemplatePreview(selectedTemplate)}
                </div>
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('emails.detail.customMessage')}
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              placeholder={t('emails.detail.customMessagePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('emails.detail.customMessageHint')}
            </p>
          </div>

          {/* Quotation Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('emails.detail.attachQuotation')}
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowQuotationSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <PaperClipIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {selectedQuotation ? t('emails.detail.changeQuotation') : t('emails.detail.selectQuotation')}
                </span>
              </button>

              {selectedQuotation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {t('emails.detail.selectedQuotation')} {selectedQuotation.clientName}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {t('emails.detail.quotationTotal')} {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        }).format(selectedQuotation.total)}
                        {' • '}
                        {selectedQuotation.items.length} {t('emails.detail.quotationItems')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedQuotation(null)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      {t('buttons.remove')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('emails.detail.quotationHint')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReply}
              disabled={replyMutation.isPending || (!selectedTemplate && !customMessage.trim())}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replyMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="h-4 w-4" />
              )}
              <span>{replyMutation.isPending ? t('buttons.sending') : t('buttons.sendResponse')}</span>
            </button>
            <button
              onClick={() => {
                setShowReplyForm(false);
                setSelectedTemplate('');
                setCustomMessage('');
                setSelectedQuotation(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Quotation Selector Modal */}
      <QuotationSelector
        selectedQuotationId={selectedQuotation?.id}
        onSelect={setSelectedQuotation}
        onClose={() => setShowQuotationSelector(false)}
        isOpen={showQuotationSelector}
      />
    </div>
  );
}