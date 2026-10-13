import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vedic: {
          900: '#1c1917',   // stone-900 — primary dark text
          800: '#e7e5e4',   // stone-200 — light borders / toggle bg
          700: '#fde68a',   // amber-200 — light accent / gradients
          gold: '#b45309',  // amber-800 — saffron heading colour
          accent: '#78716c', // stone-500 — muted text
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['EB Garamond', 'serif'],
        sans: ['EB Garamond', 'serif'],
      },
      animation: {
        shimmer:    'shimmer 2s linear infinite',
        float:      'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in':  'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
