import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Next.js legacy variables
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Theme-aware palette — consumed via CSS variables set by ThemeProvider
        bg: "var(--bg)",
        "bg-secondary": "var(--bg-secondary)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        danger: "var(--danger)",
        "theme-text": "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
      },

      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        cinzel: ["Cinzel", "serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        exo: ["Exo 2", "sans-serif"],
        bangers: ["Bangers", "cursive"],
        inter: ["Inter", "sans-serif"],
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px var(--accent)" },
          "50%": { boxShadow: "0 0 24px var(--accent), 0 0 40px rgba(245,166,35,0.3)" },
        },
      },

      backdropBlur: {
        xs: "2px",
      },

      gridTemplateColumns: {
        "dashboard-sm": "repeat(2, 1fr)",
        "dashboard-md": "repeat(3, 1fr)",
        "dashboard-lg": "repeat(4, 1fr)",
      },
    },
  },
  plugins: [],
};

export default config;
