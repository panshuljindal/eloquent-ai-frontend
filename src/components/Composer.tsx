import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';

export function Composer(props: { disabled?: boolean; onSend: (text: string) => void }) {
  const { disabled, onSend } = props;
  const [text, setText] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const content = text.trim();
    if (!content || disabled) return;
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
          <Textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Operator"
            rows={3}
            disabled={false}
          />
          <div className="flex items-center justify-end px-3 pb-3">
            <Button
              onClick={handleSend}
              disabled={disabled || text.trim().length === 0}
              variant="primary"
              size="md"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500 dark:text-white/40">
          Free research preview. Responses may be inaccurate.
        </div>
      </div>
    </div>
  );
}
