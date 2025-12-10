import { useEffect } from 'react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(onClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const variants = {
    default: 'border-border bg-card text-foreground',
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };

  return (
    <div
      className={`rounded-md border shadow-lg p-3 min-w-[240px] max-w-[320px] flex flex-col gap-1 ${variants[toast.variant || 'default']}`}
    >
      {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
      {toast.description ? <p className="text-sm text-muted-foreground">{toast.description}</p> : null}
      {toast.action ? <div className="pt-1">{toast.action}</div> : null}
    </div>
  );
}

export default Toast;

