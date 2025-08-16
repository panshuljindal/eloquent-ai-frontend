import React from 'react';
import cn from '../../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function IconButton(props: IconButtonProps): React.ReactElement {
  const { className, label, children, ...rest } = props;
  return (
    <button
      className={cn('p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5', className)}
      title={label}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
}

export default IconButton;


