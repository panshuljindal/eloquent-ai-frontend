import React from 'react';
import cn from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1f2024] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f]',
        className
      )}
      {...rest}
    />
  );
});

export default Input;


