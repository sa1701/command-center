'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotionSync, { type SyncStatus } from '@/lib/useNotionSync';

// ---------------------------------------------------------------------------
// Status indicator colors
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<SyncStatus | 'null', string> = {
  idle: 'var(--text-secondary)',
  syncing: 'var(--accent)',
  success: '#22c55e',
  error: '#ef4444',
  disconnected: '#6b7280',
  null: '#6b7280',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NotionSync() {
  const { status, connected, lastSync, syncAll } = useNotionSync();
  const [showTooltip, setShowTooltip] = useState(false);

  const color = connected === false ? STATUS_COLOR.disconnected : STATUS_COLOR[status];
  const title = connected === false
    ? 'Notion: Not connected (set NOTION_API_KEY in .env.local)'
    : status === 'syncing'
    ? 'Syncing with Notion...'
    : status === 'success'
    ? `Synced at ${lastSync}`
    : status === 'error'
    ? 'Sync failed — check console'
    : lastSync
    ? `Last sync: ${lastSync}`
    : 'Sync with Notion';

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={() => {
          if (connected !== false && status !== 'syncing') syncAll();
        }}
        className="p-2 rounded transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ color }}
        disabled={connected === false || status === 'syncing'}
        aria-label={title}
        title={title}
      >
        {status === 'syncing' ? (
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </motion.svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {/* Notion-style "N" simplified as sync arrows */}
            <polyline points="1 4 1 10 7 10" />
            <polyline points="23 20 23 14 17 14" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10" />
            <path d="M3.51 15A9 9 0 0018.36 18.36L23 14" />
          </svg>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full right-0 mt-1 px-2.5 py-1.5 rounded text-[10px] whitespace-nowrap z-50"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
