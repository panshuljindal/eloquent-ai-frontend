import React from 'react';
import { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  console.log(message);
  return (
    <div className={cn('w-full', isUser ? '' : 'bg-gray-100 dark:bg-[#2a2b32] border border-black/5 dark:border-white/5')}>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex gap-3">
          <div
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center text-xs shrink-0',
              isUser ? 'bg-[#10a37f] text-white' : 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white'
            )}
          >
            {isUser ? 'U' : 'AI'}
          </div>
          <div className="prose max-w-none prose-slate dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ node, ...props }) => (
                  <p {...props} className="leading-7 text-[15px] text-gray-900 dark:text-white/90" />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} className="leading-7 text-[15px] text-gray-900 dark:text-white/90" />
                ),
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-semibold" />
                ),
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noreferrer" />
                ),
                code: ({ node, inline, className, children, ...props }: any) => (
                  <code
                    className={cn(
                      className || '',
                      inline ? 'px-1.5 py-0.5 rounded bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white' : ''
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
  );
}
