import React, { useState } from 'react';
import { AuthCard } from './AuthCard';

export function LoginForm(props: { onSubmit: (email: string, password: string) => Promise<void>; onSwitch: () => void }) {
  const { onSubmit, onSwitch } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email || !password) {
      setError('Please enter email and password.');
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2024] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-white/80">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2024] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="text-sm text-emerald-600 dark:text-emerald-400">{success}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#10a37f] hover:bg-[#0e8e6f] text-white py-2 font-medium disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        Don’t have an account?{' '}
        <button onClick={onSwitch} className="text-[#0e8e6f] hover:underline">Sign up</button>
      </div>
    </AuthCard>
  );
}
