import type { ButtonHTMLAttributes, ElementType } from 'react';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'neutral' | 'primary-soft' | 'success-soft' | 'danger-soft' | 'neutral-active';
  icon?: React.ReactNode;
  as?: ElementType;
}

export function Pill({
  variant = 'neutral',
  icon,
  children,
  className = '',
  as: Component = 'button',
  ...props
}: PillProps) {
  const variantClass = {
    primary: 'pill-primary',
    success: 'pill-success',
    danger: 'pill-danger',
    neutral: 'pill-neutral',
    'primary-soft': 'pill-primary-soft',
    'success-soft': 'pill-success-soft',
    'danger-soft': 'pill-danger-soft',
    'neutral-active': 'pill-neutral-active',
  }[variant];

  return (
    <Component
      className={`pill ${variantClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </Component>
  );
}

Pill.displayName = 'Pill';

export default Pill;