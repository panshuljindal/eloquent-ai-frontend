import React from 'react';
import cn from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 p-4 resize-none focus:outline-none',
        className
      )}
      {...rest}
    />
  );
});

export default Textarea;


