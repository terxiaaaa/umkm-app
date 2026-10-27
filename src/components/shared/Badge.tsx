import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const variantClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
    primary: 'badge-primary',
  }[variant];

  const sizeClass = {
    sm: 'badge-sm',
    md: '',
    lg: 'badge-lg',
  }[size];

  const dotClass = dot ? 'badge-dot' : '';

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${dotClass} ${className}`}>
      {children}
    </span>
  );
}