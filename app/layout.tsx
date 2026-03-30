import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import AmbientRenderer from '@/components/ambient/AmbientRenderer';

export const metadata: Metadata = {
  title: 'Command Center | Dashboard',
  description: 'A personalised productivity dashboard — todos, habits, timers, grades, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Google Fonts are imported in globals.css via @import.
        The font-family is applied dynamically by ThemeProvider based on the
        active theme, so no next/font wrappers are needed here.
      */}
      <body className="theme-transition antialiased">
        <ThemeProvider>
          <AmbientRenderer />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
