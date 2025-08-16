import React from 'react';
import cn from '../utils/cn';
import { Button } from './ui/Button';
import { Copy } from 'lucide-react';
import { Loader } from './ui/Loader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function SummaryModal(props: {
  open: boolean;
  text: string | null;
  isLoading: boolean;
  onClose: () => void;
  onCopy: () => void;
  theme: 'light' | 'dark';
  copied: boolean;
}) {
  const { open, text, isLoading, onClose, onCopy, theme, copied } = props;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-10 max-w-2xl w-[92%] rounded-2xl border p-4", theme === 'dark' ? 'bg-[#2a2b32] border-white/10 text-white' : 'bg-white border-black/10 text-gray-900')} role="dialog" aria-modal="true" aria-labelledby="summary-title">
        <div className="flex items-center justify-between mb-2">
          <div id="summary-title" className="font-semibold text-base">Conversation Summary</div>
          <div className="flex items-center gap-1">
            <Button onClick={onCopy} size="sm" variant="neutral" disabled={!text || isLoading}>
              <Copy size={14} /> {copied ? 'Copied' : ''}
            </Button>
          </div>
        </div>
        <div className={cn("prose max-w-none prose-slate text-[15px] min-h-[60px]", theme === 'dark' ? 'dark:prose-invert' : '')}>
          {isLoading ? (
            <Loader label="Summarizing…" className={cn(theme === 'dark' ? 'text-white/70' : 'text-gray-600')} />
          ) : text ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          ) : (
            'No summary available.'
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} size="md" variant="primary">Close</Button>
        </div>
      </div>
    </div>
  );
}


