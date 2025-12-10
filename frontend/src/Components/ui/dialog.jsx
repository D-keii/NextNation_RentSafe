export function Dialog({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      {children}
    </div>
  );
}

export function DialogContent({ className = '', ...props }) {
  return (
    <div
      className={`w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border ${className}`}
      {...props}
    />
  );
}

export function DialogHeader({ className = '', ...props }) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export function DialogFooter({ className = '', ...props }) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`} {...props} />;
}

export function DialogTitle({ className = '', ...props }) {
  return <h3 className={`font-semibold text-lg ${className}`} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
}

