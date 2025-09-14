import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  showCancelButton: boolean;
  onConfirm?: () => void;
  confirmText: string;
  cancelText: string;
}

export const useCustomModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancelButton: false,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: {
      showCancelButton?: boolean;
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      showCancelButton: options?.showCancelButton || false,
      onConfirm: options?.onConfirm,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Cancel'
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showSuccess = (title: string, message: string, options?: any) => {
    showModal(title, message, 'success', options);
  };

  const showError = (title: string, message: string, options?: any) => {
    showModal(title, message, 'error', options);
  };

  const showWarning = (title: string, message: string, options?: any) => {
    showModal(title, message, 'warning', options);
  };

  const showInfo = (title: string, message: string, options?: any) => {
    showModal(title, message, 'info', options);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showModal(title, message, 'warning', {
      showCancelButton: true,
      onConfirm,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel'
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};
