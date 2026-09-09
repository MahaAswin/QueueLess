import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: 12, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${className}`}
          style={{
            paddingLeft: leftIcon ? 38 : 14,
            borderColor: error ? 'var(--color-error)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && <span style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4, display: 'block' }}>{error}</span>}
      {!error && helperText && <span style={{ color: 'var(--color-text-light)', fontSize: 12, marginTop: 4, display: 'block' }}>{helperText}</span>}
    </div>
  );
};
