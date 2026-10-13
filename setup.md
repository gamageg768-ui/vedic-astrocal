# Vedic AstroCalc — Setup Guide

## Prerequisites

- Node.js 18+ (required for swisseph native bindings)
- npm 9+
- A Groq API key (free at https://console.groq.com)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

This installs `swisseph` (Swiss Ephemeris native Node.js binding) and all other packages.

> ⚠️ `swisseph` is a native C library binding. It compiles during `npm install`.
> On Windows, you need Visual Studio Build Tools.
> On macOS/Linux it works out of the box with standard dev tools.

### 2. Configure Groq API Key

Edit `.env.local`:
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

Get a free key at: https://console.groq.com
The app uses `llama3-70b-8192` (free tier).

**The app works without a Groq key** — you just won't get AI readings.

### 3. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Architecture

```
vedic-astrocal/
├── app/
│   ├── layout.tsx              # Root layout, sticky header
│   ├── page.tsx                # Home page → <AstroApp />
│   ├── globals.css             # Vedic dark theme, custom styles
│   └── api/
│       ├── calculate/route.ts  # POST: Swiss Ephemeris engine
│       └── ai-insight/route.ts # POST: Groq LLaMA 70B reading
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   └── engine.ts               # Full Vedic calculation engine
└── components/
    ├── AstroApp.tsx            # State manager (client)
    ├── InputForm.tsx           # Birth details form (client)
    ├── ResultsView.tsx         # Results display
    ├── PanchangaGrid.tsx       # 5 panchanga cards
    ├── PlanetTable.tsx         # Divisional chart table
    ├── YogasSection.tsx        # Yoga cards
    └── AIInsightSection.tsx    # Groq AI reading (client)
```

## Key Features

- **Swiss Ephemeris** (`swisseph` npm package) for precise planetary positions
- **Lahiri Ayanamsa** — standard for Jyotish/Vedic astrology
- **Sri Lanka historical timezone** corrections (8 periods from 1880 to present)
- **Divisional charts**: D1, D4, D7, D9, D10, D20, D27, D30
- **Panchanga**: Vara, Tithi, Nakshatra, Yoga, Karana
- **Arudha Lagna** with exception handling
- **Planetary avasthas**: Lajjita, Garvita, Kshudhita, Trushita, Mudita, Kshobhita
- **Yogas**: Gajakesari, Budhaditya, Pancha Mahapurusha (5), Chandra Mangala, Guru Mangala
- **AI Reading** via Groq LLaMA-70B (on-demand, guest accessible)
- **Save Report** as .txt download
- **No sign-in required** — full guest access

## Guest Access

The app is fully accessible without authentication. No database, no accounts, no data storage. 
All calculations run on the server via Next.js API routes and are returned to the client.

## Customization

To add more cities to the Sri Lanka presets, edit `components/InputForm.tsx`:
```ts
const SRI_LANKA_CITIES = [
  { name: 'Your City', lat: X.XXXX, lon: XX.XXXX, emoji: '🏙️' },
  ...
];
```

To add more yogas, extend the `detectYogas()` function in `lib/engine.ts`.
