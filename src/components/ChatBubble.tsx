import React from 'react';
import { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import cn from '../utils/cn';

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('w-full')}>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className={cn('flex items-center gap-3', isUser ? 'flex-row-reverse justify-end' : 'justify-start')}>
          <div
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center text-xs shrink-0',
              isUser ? 'bg-[#10a37f] text-white' : 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white'
            )}
          >
            {isUser ? 'U' : 'AI'}
          </div>
          <div className={cn('max-w-[80%]', isUser ? 'ml-auto' : 'mr-auto')}>
            <div
              className={cn(
                'rounded-2xl px-3 py-2 prose max-w-none prose-p:my-0 prose-pre:my-0 prose-li:my-0 prose-ul:my-1.5 prose-ol:my-1.5',
                isUser
                  ? 'prose-invert bg-gray-800 text-white dark:bg-gray-700'
                  : 'prose-slate bg-white border border-black/10 shadow-sm dark:bg-[#2a2b32] dark:border-white/5 dark:prose-invert'
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({ node, ...props }) => (
                    <p {...props} className={cn('leading-7 text-[15px]')} />
                  ),
                  li: ({ node, ...props }) => (
                    <li {...props} className={cn('leading-7 text-[15px]')} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong {...props} className="font-semibold" />
                  ),
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer nofollow">{props.children}</a>
                  ),
                  code: ({ node, inline, className, children, ...props }: any) => (
                    <code
                      className={cn(
                        className || '',
                        inline
                          ? isUser
                            ? 'px-1.5 py-0.5 rounded bg-white/20 text-white'
                            : 'px-1.5 py-0.5 rounded bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white'
                          : ''
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
