import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${isLoading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: 17,
            height: 17,
            border: '2.5px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spinBtn 0.65s linear infinite',
            flexShrink: 0,
          }}
        />
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      <style>{`
        @keyframes spinBtn {
          to { transform: rotate(360deg); }
        }
        .btn-loading {
          opacity: 0.92;
          cursor: wait !important;
        }
      `}</style>
    </button>
  );
};
