import React from 'react';
import cn from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...rest }: CardProps): React.ReactElement {
  return (
    <div
      className={cn('rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#2a2b32] shadow-sm', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;


