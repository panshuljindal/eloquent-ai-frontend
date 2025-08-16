import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/Button';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { login, signup, loginAsGuest } = useAuth();
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#212329] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <div className="container mx-auto px-4">
        <div className="pt-10 text-center">
          <Button onClick={loginAsGuest} variant="neutral" size="sm">Continue as guest</Button>
        </div>
        {mode === 'login' ? (
          <LoginForm
            onSubmit={async (email, password) => {
              await login(email, password);
            }}
            onSwitch={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSubmit={async (name, email, password) => {
              await signup(name, email, password);
            }}
            onSwitch={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}
