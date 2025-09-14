import React from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCancelButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCancelButton = false,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const getModalStyle = () => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'info':
      default:
        return 'border-primary';
    }
  };

  const getIconStyle = () => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
      default:
        return 'text-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={`modal-content ${getModalStyle()}`}>
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center">
              <span className={`me-2 ${getIconStyle()}`} style={{ fontSize: '1.2rem' }}>
                {getIcon()}
              </span>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            {showCancelButton && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              className={`btn ${type === 'error' ? 'btn-danger' : type === 'success' ? 'btn-success' : type === 'warning' ? 'btn-warning' : 'btn-primary'}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default CustomModal;
