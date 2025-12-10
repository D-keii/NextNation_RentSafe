export function Card({ className = '', ...props }) {
  return <div className={`rounded-lg border border-border bg-card shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }) {
  return <div className={`p-4 border-b border-border ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  return <h3 className={`font-semibold text-lg ${className}`} {...props} />;
}

export function CardDescription({ className = '', ...props }) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

