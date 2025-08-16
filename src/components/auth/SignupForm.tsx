import React, { useState } from 'react';
import { AuthCard } from './AuthCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function SignupForm(props: { onSubmit: (name: string, email: string, password: string) => Promise<void>; onSwitch: () => void }) {
  const { onSubmit, onSwitch } = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(name, email, password);
      setSuccess('Account created successfully');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Start using Eloquent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-white/80">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>
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
            autoComplete="new-password"
          />
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="text-sm text-emerald-600 dark:text-emerald-400">{success}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <div className="mt-4 text-sm">
        Already have an account?{' '}<button onClick={onSwitch} className="text-[#0e8e6f] hover:underline">Sign in</button>
      </div>
    </AuthCard>
  );
}
