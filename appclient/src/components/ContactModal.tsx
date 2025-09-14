import React from 'react';
import { XMarkIcon, DocumentArrowDownIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div 
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          style={{ backgroundColor: currentTheme.colors.background.card }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-lg font-semibold leading-6"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Contact Information
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors duration-200 hover:bg-gray-100"
              style={{ color: currentTheme.colors.text.muted }}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Commercial Presentation Section */}
            <div 
              className="p-4 rounded-lg border-2 border-dashed transition-all duration-300"
              style={{ 
                borderColor: currentTheme.colors.primary[300],
                backgroundColor: currentTheme.colors.primary[50] || 'rgba(59, 130, 246, 0.05)'
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <DocumentArrowDownIcon 
                  className="w-5 h-5"
                  style={{ color: currentTheme.colors.primary[600] }}
                />
                <h4 
                  className="font-semibold"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Commercial Presentation
                </h4>
              </div>
              
              <p 
                className="text-sm mb-4"
                style={{ color: currentTheme.colors.text.muted }}
              >
                Download our professional business presentation showcasing FLOWZI's AI-powered solutions.
              </p>
              
              <div className="flex flex-col gap-2">
                <a
                  href="/docs/commercial/PDF_GENERATOR.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ 
                    backgroundColor: currentTheme.colors.primary[600],
                    color: 'white'
                  }}
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>View & Download PDF</span>
                </a>
                
                <a
                  href="/docs/commercial/FLOWZI_PRINT_VERSION.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                  style={{ 
                    borderColor: currentTheme.colors.primary[300],
                    color: currentTheme.colors.primary[600],
                    backgroundColor: 'transparent'
                  }}
                >
                  <PresentationChartBarIcon className="w-4 h-4" />
                  <span>Print Version</span>
                </a>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              For more information about the product, please contact:
            </p>

            {/* Contact Cards */}
            <div className="space-y-3">
              {/* Marcelo Hernandes */}
              <div 
                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: currentTheme.colors.background.primary,
                  borderColor: currentTheme.colors.border.secondary 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: currentTheme.colors.primary[600] }}
                  >
                    MH
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Marcelo Hernandes
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      marcelohs40@gmail.com
                    </p>
                    <a
                      href="https://marcelohsilva.onrender.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                    >
                      Personal Website
                    </a>
                  </div>
                </div>
              </div>

              {/* Sarah Ribeiro */}
              <div 
                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: currentTheme.colors.background.primary,
                  borderColor: currentTheme.colors.border.secondary 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: currentTheme.colors.primary[600] }}
                  >
                    SR
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Sarah Ribeiro - CEO
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      iamsarahribeiro@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ 
                backgroundColor: currentTheme.colors.primary[600],
                color: 'white'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
