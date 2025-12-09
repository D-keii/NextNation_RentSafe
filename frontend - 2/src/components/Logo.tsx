import { Shield } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="gradient-primary rounded-lg p-2">
          <Shield className={`${sizeClasses[size]} text-primary-foreground`} />
        </div>
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse-soft" />
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} text-foreground`}>
          Rent<span className="text-accent">Safe</span>
        </span>
      )}
    </div>
  );
}
