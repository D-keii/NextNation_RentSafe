import { useState, useRef, useEffect, cloneElement } from 'react';

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {typeof children === 'function' ? children({ open, setOpen }) : children}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, className = '', open, setOpen }) {
  const handleClick = () => {
    setOpen(!open);
  };

  if (asChild) {
    if (typeof children === 'function') {
      return children({ open, setOpen, onClick: handleClick });
    }
    if (children && typeof children === 'object' && 'type' in children) {
      return cloneElement(children, {
        onClick: handleClick,
        className: `${children.props?.className || ''} ${className}`.trim(),
      });
    }
  }

  return (
    <button className={className} onClick={handleClick}>
      {typeof children === 'function' ? children({ open, setOpen }) : children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = 'end', className = '', open }) {
  if (!open) return null;

  const alignClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 text-foreground shadow-lg ${alignClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = '' }) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = '' }) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }) {
  return <div className={`-mx-1 my-1 h-px bg-muted ${className}`} />;
}
