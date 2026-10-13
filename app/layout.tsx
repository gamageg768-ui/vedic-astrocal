import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vedic AstroCalc — Sidereal Birth Chart Calculator',
  description:
    'Precision Vedic astrology calculations powered by Swiss Ephemeris. Lahiri ayanamsa, panchanga, divisional charts, yogas, and AI-powered insights.',
  manifest: '/manifest.json',
  themeColor: '#fffdf7',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'Vedic AstroCalc',
    description: 'Precision Vedic astrology with Swiss Ephemeris & AI insights',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-700 animate-pulse-gold"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
              </svg>
              <h1
                className="font-display text-xl sm:text-2xl font-semibold gold-shimmer"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Vedic AstroCalc
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-display text-stone-500 tracking-widest uppercase">
                Lahiri Ayanamsa
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-display text-stone-500 tracking-widest uppercase">
                Sidereal Zodiac
              </span>
              <span className="ml-3 px-2 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-display">
                Guest Access ✓
              </span>
            </div>

            <div className="md:hidden">
              <span className="px-2 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs">
                Free
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative">{children}</main>

        {/* Footer */}
        <footer className="border-t border-stone-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-stone-400 text-xs font-body">
              Calculations powered by{' '}
              <span className="text-stone-500">Astronomia (VSOP87)</span> · Lahiri
              Ayanamsa · AI insights by{' '}
              <span className="text-stone-500">Groq LLaMA 70B</span>
            </p>
            <p className="text-stone-300 text-xs mt-1">
              For educational and spiritual purposes · Guest access · No sign-in required
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
