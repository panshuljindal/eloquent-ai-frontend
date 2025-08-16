import React from 'react';
import { Loader2 } from 'lucide-react';
import cn from '../../utils/cn';

export interface LoaderProps {
  label?: string;
  className?: string;
  size?: number;
}

export function Loader({ label = 'Loading…', className, size = 16 }: LoaderProps): React.ReactElement {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className="animate-spin" size={size} /> {label}
    </div>
  );
}

export default Loader;


