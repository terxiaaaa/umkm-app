import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  elevated?: boolean;
}

export default function Card({
  children,
  className = '',
  padded = 'md',
  hover = false,
  elevated = false,
}: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'card-padded-sm',
    md: 'card-padded',
    lg: 'card-padded-lg',
  }[padded];

  const hoverClass = hover ? 'card-hover' : '';
  const elevatedClass = elevated ? 'card-elevated' : '';

  return (
    <div className={`card ${paddingClass} ${hoverClass} ${elevatedClass} ${className}`}>
      {children}
    </div>
  );
}