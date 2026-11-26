import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CloudLightning } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getRoleHomeRoute, isRouteAllowedForRole } from '../../utils/auth';
import { getApiErrorMessage } from '../../utils/errors';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSeconds, setSubmitSeconds] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isSubmitting) {
      setSubmitSeconds(0);
      timer = setInterval(() => {
        setSubmitSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSubmitSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isSubmitting]);

  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({ email: email.trim(), password });

      // Role-safe navigation: only honor requested path if permissible for authenticated role
      const roleHome = getRoleHomeRoute(user.role);
      const targetPath = (from && isRouteAllowedForRole(from, user.role))
        ? from
        : roleHome;

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, 'Invalid email or password. Please check your credentials or create an account.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-main)' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
          Enter your credentials to access your QueueLess account.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--color-error)',
            fontSize: 13.5,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={17} />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={17} />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          loadingText="Signing In..."
          style={{ width: '100%', marginTop: 8 }}
          icon={<ArrowRight size={17} />}
        >
          Sign In
        </Button>

        {isSubmitting && submitSeconds >= 2 && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-tint, #F0FDF4)',
              border: '1px solid var(--color-tint-border, #BBF7D0)',
              color: 'var(--color-primary, #0F5132)',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <CloudLightning size={16} className="pulse-lightning" style={{ flexShrink: 0 }} />
            <span>
              {submitSeconds >= 5
                ? 'Waking up secure cloud server (Render free tier). Hang tight!'
                : 'Connecting to QueueLess server... Please wait a moment.'}
            </span>
          </div>
        )}
      </form>

      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          Create an Account
        </Link>
      </div>
    </div>
  );
};
