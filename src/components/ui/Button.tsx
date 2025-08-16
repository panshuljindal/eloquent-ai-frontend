import React from 'react';
import cn from '../../utils/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'destructive' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button(props: ButtonProps): React.ReactElement {
  const { className, variant = 'primary', size = 'md', children, ...rest } = props;

  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-sm px-2.5 py-1.5',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
    icon: 'p-2',
  };
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#10a37f] text-white hover:bg-[#0e8e6f] focus:outline-none',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/10',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    neutral: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
  };

  return (
    <button className={cn(base, sizeStyles[size], variantStyles[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export default Button;


