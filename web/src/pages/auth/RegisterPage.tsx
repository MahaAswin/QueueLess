import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, Store, CloudLightning } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/auth.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput, COUNTRIES, type CountryOption } from '../../components/ui/PhoneInput';
import { getRoleHomeRoute } from '../../utils/auth';
import { getApiErrorMessage } from '../../utils/errors';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]); // Default to India (+91)
  const [nationalNumber, setNationalNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNumber = nationalNumber.trim().replace(/[^\d]/g, '');

    if (!fullName || !email || !cleanNumber || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (cleanNumber.length < 7 || cleanNumber.length > 14) {
      setErrorMsg('Please enter a valid phone number (between 7 and 14 digits).');
      return;
    }

    const fullPhoneNumber = `${country.code}${cleanNumber}`;

    try {
      setIsSubmitting(true);
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: fullPhoneNumber,
        password,
        role,
      });

      navigate(getRoleHomeRoute(user.role), { replace: true });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, 'Registration failed. Please verify your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-main)' }}>
          Create Account
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
          Join QueueLess for zero-wait pickups and streamlined orders.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: 4,
          backgroundColor: 'var(--color-surface-subtle)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          onClick={() => setRole('CUSTOMER')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: role === 'CUSTOMER' ? 'var(--color-surface)' : 'transparent',
            color: role === 'CUSTOMER' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            boxShadow: role === 'CUSTOMER' ? 'var(--shadow-xs)' : 'none',
            border: role === 'CUSTOMER' ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
        >
          <User size={16} />
          <span>Customer</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('SHOP_OWNER')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: role === 'SHOP_OWNER' ? 'var(--color-surface)' : 'transparent',
            color: role === 'SHOP_OWNER' ? 'var(--color-primary-deep)' : 'var(--color-text-muted)',
            boxShadow: role === 'SHOP_OWNER' ? 'var(--shadow-xs)' : 'none',
            border: role === 'SHOP_OWNER' ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
        >
          <Store size={16} />
          <span>Shop Owner</span>
        </button>
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
          label="Full Name"
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={17} />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={17} />}
          required
        />

        <PhoneInput
          label="Phone Number"
          selectedCountryIso={country.iso}
          onCountryChange={(selected) => setCountry(selected)}
          nationalNumber={nationalNumber}
          onNationalNumberChange={(cleanNum) => setNationalNumber(cleanNum)}
          required
        />

        <Input
          label="Password (min. 6 characters)"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={17} />}
          required
          minLength={6}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          loadingText="Creating Account..."
          style={{ width: '100%', marginTop: 8 }}
          icon={<ArrowRight size={17} />}
        >
          Create {role === 'SHOP_OWNER' ? 'Shop Owner' : 'Customer'} Account
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
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
