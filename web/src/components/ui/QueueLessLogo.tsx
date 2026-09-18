import React from 'react';
import logoImg from '../../assets/logo.png';

export interface QueueLessLogoProps {
  /**
   * Predefined size or custom numeric pixel height
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Optional custom subtitle (e.g. 'EXPRESS PICKUP', 'SHOP PARTNER', 'ADMIN CONTROL')
   */
  subtitle?: string;
  /**
   * Color for the subtitle text
   */
  subtitleColor?: string;
  /**
   * Color for the main QueueLess title text
   */
  textColor?: string;
  /**
   * Whether to render the text side-by-side or logo mark only
   */
  variant?: 'standard' | 'mark-only' | 'hero';
  /**
   * Optional custom class name
   */
  className?: string;
  /**
   * Optional custom click handler or link
   */
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { icon: 32, title: 16, sub: 9.5, gap: 8 },
  md: { icon: 38, title: 18, sub: 10.5, gap: 10 },
  lg: { icon: 48, title: 22, sub: 11.5, gap: 12 },
  xl: { icon: 64, title: 28, sub: 13, gap: 14 },
};

export const QueueLessLogo: React.FC<QueueLessLogoProps> = ({
  size = 'md',
  subtitle,
  subtitleColor,
  textColor,
  variant = 'standard',
  className = '',
  onClick,
}) => {
  const dimensions = typeof size === 'number'
    ? { icon: size, title: Math.round(size * 0.48), sub: Math.round(size * 0.28), gap: Math.round(size * 0.25) }
    : SIZE_MAP[size];

  if (variant === 'hero') {
    return (
      <div
        className={`queueless-logo-hero ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 12,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        <img
          src={logoImg}
          alt="QueueLess Official Logo"
          style={{
            height: dimensions.icon * 2,
            width: 'auto',
            maxHeight: 120,
            objectFit: 'contain',
            borderRadius: 12,
          }}
        />
        {subtitle && (
          <div
            style={{
              fontSize: dimensions.sub,
              fontWeight: 700,
              color: subtitleColor || 'var(--color-primary-deep, #0D5C3A)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <img
        src={logoImg}
        alt="QueueLess Logo"
        className={`queueless-logo-mark ${className}`}
        style={{
          height: dimensions.icon,
          width: dimensions.icon,
          objectFit: 'contain',
          borderRadius: 8,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`queueless-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      <img
        src={logoImg}
        alt="QueueLess"
        style={{
          height: dimensions.icon,
          width: dimensions.icon,
          objectFit: 'contain',
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading, inherit)',
            fontWeight: 800,
            fontSize: dimensions.title,
            color: textColor || 'var(--color-primary-deep, #0D5C3A)',
            letterSpacing: '-0.3px',
            lineHeight: 1.15,
          }}
        >
          QueueLess
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: dimensions.sub,
              fontWeight: 700,
              color: subtitleColor || 'var(--color-text-light, #64748B)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
