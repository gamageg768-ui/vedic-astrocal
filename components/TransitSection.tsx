'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChartResult, TransitPlanet } from '@/lib/types';

const SIGNS_FULL = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_EMOJI: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_COLOR: Record<string, string> = {
  Sun: 'text-amber-600',    Moon: 'text-slate-500',
  Mars: 'text-red-600',     Mercury: 'text-emerald-600',
  Jupiter: 'text-yellow-600', Venus: 'text-pink-500',
  Saturn: 'text-stone-500', Rahu: 'text-violet-600',
  Ketu: 'text-orange-500',
};

export default function TransitSection({ result }: { result: ChartResult }) {
  const [transits, setTransits] = useState<Record<string, TransitPlanet> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const natalLagnaSign = result.ascendant.sign;

  const fetchTransits = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/transits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ natalLagnaSign }),
      });
      const data = await res.json() as Record<string, TransitPlanet> | { error: string };
      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? (data as { error: string }).error : 'Failed');
      }
      setTransits(data as Record<string, TransitPlanet>);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load transits');
    } finally {
      setLoading(false);
    }
  }, [natalLagnaSign]);

  useEffect(() => { void fetchTransits(); }, [fetchTransits]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-1 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>🌐</span> Current Transits
      </h3>
      <p className="text-xs text-stone-400 font-body mb-4">
        Today's sidereal positions · {today} · Houses relative to natal {result.ascendant.sign_name} lagna
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-stone-500 text-sm py-4">
          <svg className="animate-spin w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Calculating current planetary positions…
        </div>
      ) : fetchError ? (
        <div className="flex items-center gap-3 py-4">
          <span className="text-red-500 text-sm">{fetchError}</span>
          <button onClick={() => void fetchTransits()} className="text-xs text-amber-600 underline">
            Retry
          </button>
        </div>
      ) : transits ? (
        <div className="space-y-1">
          <div className="grid grid-cols-[1.25rem_4.5rem_1fr_2.5rem_5rem] gap-x-2 px-3 py-1 text-xs text-stone-400 font-display uppercase tracking-wide">
            <span />
            <span>Planet</span>
            <span>Transit position</span>
            <span>House</span>
            <span className="hidden sm:block">Natal sign</span>
          </div>
          {PLANET_ORDER.map((name) => {
            const t = transits[name];
            if (!t) return null;
            const natal = result.planets[name];
            const natalSignName = natal ? SIGNS_FULL[natal.sign] : '—';
            const sameSign = natal && t.sign === natal.sign;
            return (
              <div
                key={name}
                className={`grid grid-cols-[1.25rem_4.5rem_1fr_2.5rem_5rem] gap-x-2 items-center px-3 py-2 rounded-lg text-sm ${
                  sameSign ? 'bg-amber-50/60 border border-amber-100' : 'bg-white/40'
                }`}
              >
                <span className={`text-base leading-none ${PLANET_COLOR[name]}`}>{PLANET_EMOJI[name]}</span>
                <span
                  className="font-display font-semibold text-stone-700 text-xs"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {name}
                </span>
                <span className="text-stone-600 text-xs">
                  {SIGNS_FULL[t.sign]} {t.degree.toFixed(1)}°
                  {t.is_retrograde && <span className="text-stone-400 ml-1">(R)</span>}
                  <span className="text-stone-400 ml-1.5">· {t.nakshatra}</span>
                </span>
                <span className={`text-xs text-center font-semibold ${sameSign ? 'text-amber-700' : 'text-stone-500'}`}>
                  H{t.house}
                </span>
                <span className="text-xs text-stone-400 hidden sm:block">
                  {natalSignName}
                  {sameSign && <span className="ml-1 text-amber-500">●</span>}
                </span>
              </div>
            );
          })}
          <p className="text-xs text-stone-400 mt-2 font-body px-1">
            ● = transiting same sign as natal · (R) = retrograde · House numbers from natal lagna
          </p>
        </div>
      ) : null}
    </div>
  );
}
