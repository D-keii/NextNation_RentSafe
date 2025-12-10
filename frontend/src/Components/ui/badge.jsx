export function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-muted text-foreground ${className}`}>
      {children}
    </span>
  );
}

export default Badge;

