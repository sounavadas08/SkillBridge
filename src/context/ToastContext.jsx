import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 9999;
          pointer-events: none;
        }
        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #0a233f;
          color: #ffffff;
          padding: 12px 18px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(45, 212, 191, 0.3);
          font-size: 0.875rem;
          font-weight: 500;
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 260px;
          max-width: 420px;
        }
        .toast-success .toast-icon {
          color: #2dd4bf;
          font-weight: bold;
        }
        .toast-close {
          margin-left: auto;
          color: #94a3b8;
          font-size: 1.2rem;
          line-height: 1;
          padding: 2px 4px;
        }
        .toast-close:hover {
          color: #ffffff;
        }
        @keyframes toastSlideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
