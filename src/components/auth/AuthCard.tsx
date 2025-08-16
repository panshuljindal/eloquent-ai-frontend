import React from 'react';
import { Card } from '../ui/Card';

export function AuthCard(props: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const { title, subtitle, children, footer } = props;
  return (
    <Card className="max-w-md w-full mx-auto mt-24 p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-white/60 mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
      {footer && <div className="mt-6 text-sm text-gray-600 dark:text-white/60">{footer}</div>}
    </Card>
  );
}
