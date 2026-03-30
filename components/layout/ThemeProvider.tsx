'use client';

import { useEffect } from 'react';
import useDashboardStore from '@/lib/store';
import { getTheme } from '@/lib/themes';

/**
 * ThemeProvider
 *
 * Reads the active themeId from Zustand, resolves the Theme object,
 * then writes all theme colors as CSS custom properties onto
 * document.documentElement so every component can consume them via
 * var(--accent) etc.  Also sets the body font-family.
 *
 * Renders no DOM of its own — purely a side-effect component.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useDashboardStore((state) => state.themeId);

  useEffect(() => {
    const theme = getTheme(themeId);
    const root = document.documentElement;

    // Apply all color tokens
    root.style.setProperty('--bg',               theme.colors.bg);
    root.style.setProperty('--bg-secondary',     theme.colors.bgSecondary);
    root.style.setProperty('--accent',           theme.colors.accent);
    root.style.setProperty('--accent-secondary', theme.colors.accentSecondary);
    root.style.setProperty('--danger',           theme.colors.danger);
    root.style.setProperty('--text',             theme.colors.text);
    root.style.setProperty('--text-secondary',   theme.colors.textSecondary);
    root.style.setProperty('--card-bg',          theme.colors.cardBg);
    root.style.setProperty('--card-border',      theme.colors.cardBorder);

    // Keep Next.js legacy variables in sync
    root.style.setProperty('--background', theme.colors.bg);
    root.style.setProperty('--foreground', theme.colors.text);

    // Apply font
    document.body.style.fontFamily = `'${theme.font}', sans-serif`;

    // Apply card-style class to body so .glass-card modifier classes work
    const allCardStyles = ['holographic', 'ornate', 'stark', 'neon', 'comic', 'tech'];
    allCardStyles.forEach((style) => {
      document.body.classList.remove(`card-style--${style}`);
    });
    document.body.classList.add(`card-style--${theme.cardStyle}`);

    // Apply ambient-effect data attribute for ambient layer components
    const effects = Array.isArray(theme.ambientEffect)
      ? theme.ambientEffect.join(' ')
      : theme.ambientEffect;
    document.body.dataset.ambientEffect = effects;
    document.body.dataset.themeId = theme.id;
  }, [themeId]);

  return <>{children}</>;
}
