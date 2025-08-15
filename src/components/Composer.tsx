import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Composer(props: { disabled?: boolean; onSend: (text: string) => void }) {
  const { disabled, onSend } = props;
  const [text, setText] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const content = text.trim();
    if (!content) return;
    onSend(content);
    setText('');
    textRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-black/10 dark:border-white/10 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 focus-within:border-[#10a37f] transition-colors">
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Operator"
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 p-4 resize-none focus:outline-none"
            rows={3}
            disabled={disabled}
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="text-xs text-gray-500 dark:text-white/40">Press Enter to send</div>
            <button
              onClick={handleSend}
              disabled={disabled || text.trim().length === 0}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                'bg-[#10a37f] text-white hover:bg-[#0e8e6f] disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Send size={16} /> Send
            </button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-white/40">
          Free research preview. Responses may be inaccurate.
        </div>
      </div>
    </div>
  );
}
