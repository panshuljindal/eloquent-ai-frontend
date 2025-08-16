import React, { useState } from 'react';
import { AuthCard } from './AuthCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm(props: { onSubmit: (email: string, password: string) => Promise<void>; onSwitch: () => void; onGuest?: () => void }) {
  const { onSubmit, onSwitch, onGuest } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email && !password) {
      setError('Please enter email and password.');
      return;
    }

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, password);
      setSuccess('Logged in successfully');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Log in" subtitle="Access your Eloquent account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-white/80">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-white/80">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="text-sm text-emerald-600 dark:text-emerald-400">{success}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        {onGuest && (
          <Button type="button" variant="neutral" onClick={onGuest} className="w-full">
            Continue as guest
          </Button>
        )}
      </form>
      <div className="mt-4 text-sm">
        Don’t have an account?{' '}<button onClick={onSwitch} className="text-[#0e8e6f] hover:underline">Sign up</button>
      </div>
    </AuthCard>
  );
}
