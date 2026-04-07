'use client';

import { useState } from 'react';
import { useBookmarkStore } from '@/lib/widget-store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

// ---------------------------------------------------------------------------
// BookmarkCard
// ---------------------------------------------------------------------------

function BookmarkCard({
  id,
  name,
  url,
  onDelete,
}: {
  id: string;
  name: string;
  url: string;
  onDelete: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1.5 p-3 rounded border text-center transition-all hover:scale-105"
        style={{
          borderColor: 'var(--card-border)',
          background: 'var(--card-bg)',
        }}
        aria-label={`Open ${name} (${getDomain(url)}) in new tab`}
      >
        {imgError ? (
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold"
            style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}
            aria-hidden
          >
            {name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            src={getFaviconUrl(url)}
            alt={`${name} favicon`}
            width={28}
            height={28}
            className="w-7 h-7 rounded"
            onError={() => setImgError(true)}
          />
        )}
        <span
          className="text-xs font-medium truncate w-full"
          style={{ color: 'var(--text)' }}
        >
          {name}
        </span>
      </a>

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(id);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-80 hover:opacity-100 transition-opacity rounded-full p-0.5"
        style={{ background: 'var(--danger)', color: '#fff' }}
        aria-label={`Delete bookmark: ${name}`}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bookmarks Widget
// ---------------------------------------------------------------------------

export default function Bookmarks() {
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(bookmarks.map((b) => b.category).filter(Boolean)))];

  const filtered =
    filterCat === 'all' ? bookmarks : bookmarks.filter((b) => b.category === filterCat);

  function handleAdd() {
    const trimName = name.trim();
    let trimUrl = url.trim();
    if (!trimName || !trimUrl) return;
    // Auto-prepend https if missing
    if (!/^https?:\/\//i.test(trimUrl)) trimUrl = `https://${trimUrl}`;
    addBookmark(trimName, trimUrl, category.trim() || 'Other');
    setName('');
    setUrl('');
    setCategory('');
    setShowForm(false);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Category filter */}
      {categories.length > 1 && (
        <div
          className="flex gap-1 flex-wrap shrink-0 border-b pb-2"
          style={{ borderColor: 'var(--card-border)' }}
          role="tablist"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={filterCat === cat}
              onClick={() => setFilterCat(cat)}
              className="px-2.5 py-0.5 rounded text-xs capitalize transition-colors"
              style={{
                background: filterCat === cat ? 'var(--accent)' : 'transparent',
                color: filterCat === cat ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No bookmarks yet. Save your favorite links!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.id}
                id={b.id}
                name={b.name}
                url={b.url}
                onDelete={removeBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <div
          className="flex flex-col gap-2 pt-3 border-t shrink-0"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-transparent border rounded px-2 py-1 text-xs outline-none"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-label="Bookmark name"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="URL (e.g. github.com)"
            className="w-full bg-transparent border rounded px-2 py-1 text-xs outline-none"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-label="Bookmark URL"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="w-full bg-transparent border rounded px-2 py-1 text-xs outline-none"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-label="Bookmark category"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !url.trim()}
              className="flex-1 py-1 rounded text-xs font-medium disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              aria-label="Save bookmark"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-1 rounded text-xs border"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 w-full py-1.5 rounded text-xs border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          aria-label="Add new bookmark"
        >
          + Add Bookmark
        </button>
      )}
    </div>
  );
}
