import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastCount = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type) => {
    const id = ++toastCount;
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      if (newToasts.length > 5) {
        return newToasts.slice(newToasts.length - 5);
      }
      return newToasts;
    });

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 right-0 z-[400] p-4 w-full md:w-96 md:max-w-sm pointer-events-none flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem = ({ toast, onClose }) => {
  const { type, message } = toast;
  
  const variants = {
    success: {
      bg: 'bg-success-50 border-success-200',
      icon: <CheckCircle2 className="h-5 w-5 text-success-500" />,
      text: 'text-success-700'
    },
    error: {
      bg: 'bg-danger-50 border-danger-200',
      icon: <XCircle className="h-5 w-5 text-danger-500" />,
      text: 'text-danger-700'
    },
    warning: {
      bg: 'bg-warning-50 border-warning-200',
      icon: <AlertTriangle className="h-5 w-5 text-warning-500" />,
      text: 'text-warning-700'
    },
    info: {
      bg: 'bg-info-50 border-info-200',
      icon: <Info className="h-5 w-5 text-info-500" />,
      text: 'text-info-700'
    }
  };

  const currentVariant = variants[type] || variants.info;

  return (
    <div 
      className={cn(
        "pointer-events-auto flex w-full items-start p-4 shadow-md rounded-lg border toast-enter",
        currentVariant.bg
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {currentVariant.icon}
      </div>
      <div className={cn("flex-1 text-sm font-medium", currentVariant.text)}>
        {message}
      </div>
      <button
        onClick={onClose}
        className={cn(
          "flex-shrink-0 ml-4 rounded-md inline-flex hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2",
          currentVariant.text
        )}
      >
        <span className="sr-only">Close</span>
        <X className="h-4 w-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
};

export default ToastProvider;
