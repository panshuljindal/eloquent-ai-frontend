import React from 'react';
import { Sparkles } from 'lucide-react';
import cn from '../../utils/cn';

export interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo(props: AppLogoProps): React.ReactElement {
  const { size = 24, className } = props;
  const containerSize = `${size}px`;
  const iconSize = Math.max(14, Math.round(size * 0.65));

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg overflow-hidden shadow-sm',
        'bg-gradient-to-br from-[#10a37f] via-[#12b887] to-[#0d8b6c] dark:from-[#10a37f] dark:via-[#0ea37a] dark:to-[#0a7b5f]',
        className
      )}
      style={{ width: containerSize, height: containerSize }}
      aria-label="Eloquent Operator"
      title="Eloquent Operator"
    >
      <Sparkles size={iconSize} className="text-white/95 drop-shadow-sm" />
      <div className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
    </div>
  );
}

export default AppLogo;


