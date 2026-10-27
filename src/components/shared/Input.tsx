import type { InputHTMLAttributes, SelectHTMLAttributes, ElementType } from 'react';

interface BaseInputProps {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

type InputProps = BaseInputProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & { as?: ElementType };

export function Input({
  label,
  hint,
  error,
  size = 'md',
  className = '',
  id,
  as: Component = 'input',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const sizeClass = {
    sm: 'input-sm',
    md: '',
    lg: 'input-lg',
  }[size];

  const errorClass = error ? 'input-error' : '';

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <Component
        id={inputId}
        className={`input ${sizeClass} ${errorClass} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hintId || ''} ${errorId || ''}`.trim() || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="field-hint">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">{error}</p>
      )}
    </div>
  );
}

Input.displayName = 'Input';

export interface SelectProps extends BaseInputProps {
  options: { value: string; label: string }[];
}

type SelectPropsFull = SelectProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { as?: ElementType };

export function Select({
  label,
  hint,
  error,
  options,
  size = 'md',
  className = '',
  id,
  as: Component = 'select',
  ...props
}: SelectPropsFull) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${selectId}-error` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;

  const sizeClass = {
    sm: 'input-sm',
    md: '',
    lg: 'input-lg',
  }[size];

  const errorClass = error ? 'input-error' : '';

  return (
    <div className="field">
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <Component
        id={selectId}
        className={`input ${sizeClass} ${errorClass} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hintId || ''} ${errorId || ''}`.trim() || undefined}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Component>
      {hint && !error && (
        <p id={hintId} className="field-hint">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">{error}</p>
      )}
    </div>
  );
}

Select.displayName = 'Select';

export default Input;