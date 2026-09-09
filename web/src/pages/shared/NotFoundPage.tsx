import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-sage)',
          color: 'var(--color-primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <FileQuestion size={36} />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 16, maxWidth: 440, marginBottom: 28 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon={<ArrowLeft size={16} />}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
