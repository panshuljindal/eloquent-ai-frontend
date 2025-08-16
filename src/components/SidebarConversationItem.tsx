import React from 'react';
import { MessageSquareText, Trash2 } from 'lucide-react';
import cn from '../utils/cn';
import { IconButton } from './ui/IconButton';

export function SidebarConversationItem(props: {
  active?: boolean;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  const { active, title, subtitle, onClick, onDelete } = props;
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className={cn(
        'w-full text-left px-3 py-2 rounded-xl transition-colors group cursor-pointer',
        active ? 'bg-gray-200 dark:bg-[#2a2b32]' : 'hover:bg-black/5 dark:hover:bg-[#2a2b32]/60'
      )}
    >
      <div className="flex items-center gap-2">
        <MessageSquareText size={16} className="opacity-80" />
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm text-gray-900 dark:text-white/90">{title}</div>
          {!!subtitle && (
            <div className="truncate text-xs text-gray-500 dark:text-white/60">{subtitle}</div>
          )}
        </div>
        {onDelete && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            label="Delete conversation"
          >
            <Trash2 size={14} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
