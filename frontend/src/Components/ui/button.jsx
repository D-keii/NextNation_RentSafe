const variants = {
  default: 'bg-primary text-white hover:opacity-90',
  accent: 'bg-accent text-white hover:opacity-90',
  secondary: 'bg-white text-foreground border border-border hover:bg-muted',
  outline: 'border border-border text-foreground hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-white hover:opacity-90',
};

const sizes = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-5 py-3 text-base',
  icon: 'p-2',
};

export function Button({ variant = 'default', size = 'default', className = '', ...props }) {
  const classes = [
    'inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant] || variants.default,
    sizes[size] || sizes.default,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props} />
  );
}

export default Button;

