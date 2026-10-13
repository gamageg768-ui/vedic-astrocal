'use client';

import { useState } from 'react';
import type { ChartResult } from '@/lib/types';

const SIGNS_FULL = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGNS_SHORT = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];

// South Indian chart: cell index (row*4+col) → sign index, -1 = center empty
const CELL_TO_SIGN = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5];

const VARGAS = [
  { n: 1,  name: 'Rashi',           field: 'd1',  sig: 'Overall self, body, personality' },
  { n: 2,  name: 'Hora',            field: 'd2',  sig: 'Wealth, financial prosperity' },
  { n: 3,  name: 'Drekkana',        field: 'd3',  sig: 'Siblings, courage, longevity' },
  { n: 4,  name: 'Chaturthamsha',   field: 'd4',  sig: 'Fixed assets, home, fortune' },
  { n: 6,  name: 'Shashthamsha',    field: 'd6',  sig: 'Health, diseases, enemies, debts' },
  { n: 7,  name: 'Saptamsha',       field: 'd7',  sig: 'Children, grandchildren' },
  { n: 8,  name: 'Ashtamsha',       field: 'd8',  sig: 'Longevity, obstacles, transformation' },
  { n: 9,  name: 'Navamsha',        field: 'd9',  sig: 'Spouse, dharma, spiritual strength' },
  { n: 10, name: 'Dashamsha',       field: 'd10', sig: 'Career, profession, social status' },
  { n: 11, name: 'Ekadashamamsha',  field: 'd11', sig: 'Gains, friends, social network' },
  { n: 12, name: 'Dwadashamsha',    field: 'd12', sig: 'Parents, ancestral lineage' },
  { n: 16, name: 'Shodashamsha',    field: 'd16', sig: 'Vehicles, comforts, luxuries' },
  { n: 20, name: 'Vimshamsha',      field: 'd20', sig: 'Spiritual life, upasana, worship' },
  { n: 24, name: 'Siddhamsha',      field: 'd24', sig: 'Education, learning, knowledge' },
  { n: 27, name: 'Bhamsha',         field: 'd27', sig: 'Physical strength, vitality' },
  { n: 30, name: 'Trimshamsha',     field: 'd30', sig: 'Troubles, hidden enemies, evils' },
  { n: 40, name: 'Khavedamsha',     field: 'd40', sig: 'Auspicious events, maternal legacy' },
  { n: 45, name: 'Akshavedamsha',   field: 'd45', sig: 'Father, paternal legacy' },
  { n: 60, name: 'Shashtyamsha',    field: 'd60', sig: 'Past life karma, overall well-being' },
] as const;

type VargaField = typeof VARGAS[number]['field'];

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_EMOJI: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

function getPlanetsInSign(result: ChartResult, field: VargaField, signIdx: number): string[] {
  const names: string[] = [];
  const lagnaVal = (result.lagna as Record<string, number>)[field];
  if (lagnaVal === signIdx) names.push('Lagna');
  for (const name of PLANET_ORDER) {
    const p = result.planets[name];
    if (p && (p as unknown as Record<string, number>)[field] === signIdx) {
      names.push(name);
    }
  }
  return names;
}

interface VargaExplorerProps {
  result: ChartResult;
}

export default function VargaExplorer({ result }: VargaExplorerProps) {
  const [selectedN, setSelectedN] = useState<number>(9);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const [insight, setInsight] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<Record<number, string>>({});

  const currentVarga = VARGAS.find((v) => v.n === selectedN)!;

  async function fetchInsight(n: number) {
    if (insight[n] || loading[n]) return;
    setLoading((prev) => ({ ...prev, [n]: true }));
    setError((prev) => ({ ...prev, [n]: '' }));
    try {
      const res = await fetch('/api/varga-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: result, varga: n }),
      });
      const data = await res.json() as { insight?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Request failed');
      setInsight((prev) => ({ ...prev, [n]: data.insight ?? '' }));
    } catch (e) {
      setError((prev) => ({ ...prev, [n]: e instanceof Error ? e.message : 'Failed' }));
    } finally {
      setLoading((prev) => ({ ...prev, [n]: false }));
    }
  }

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>✦</span> Varga Chart Explorer
      </h3>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {VARGAS.map((v) => (
          <button
            key={v.n}
            onClick={() => setSelectedN(v.n)}
            className={`px-2.5 py-1 rounded-lg text-xs font-display border transition-colors ${
              selectedN === v.n
                ? 'bg-amber-100 border-amber-400 text-amber-800 font-semibold'
                : 'btn-ghost border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            D{v.n}
          </button>
        ))}
      </div>

      {/* Varga header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-3 pb-3 border-b border-amber-100">
        <span
          className="font-display text-amber-800 text-base font-semibold"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          D{currentVarga.n} — {currentVarga.name}
        </span>
        <span className="hidden sm:block text-stone-300 mx-2">·</span>
        <span className="text-stone-500 text-sm font-body">{currentVarga.sig}</span>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-4 p-0.5 bg-stone-100 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 rounded-md text-xs font-display transition-all ${
            viewMode === 'list'
              ? 'bg-white shadow-sm text-amber-700 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          House List
        </button>
        <button
          onClick={() => setViewMode('chart')}
          className={`px-3 py-1 rounded-md text-xs font-display transition-all ${
            viewMode === 'chart'
              ? 'bg-white shadow-sm text-amber-700 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          South Indian
        </button>
      </div>

      {/* Chart view or list view */}
      {(() => {
        const lagnaSignIdx = (result.lagna as Record<string, number>)[currentVarga.field] ?? 0;

        if (viewMode === 'chart') {
          return (
            <div className="grid grid-cols-4 gap-0.5 mb-5">
              {CELL_TO_SIGN.map((signIdx, cellI) => {
                if (signIdx === -1) {
                  return (
                    <div
                      key={cellI}
                      className="min-h-[5rem] rounded bg-stone-50/40 flex items-center justify-center"
                    >
                      {cellI === 5 && (
                        <div className="text-center">
                          <div className="text-stone-200 text-sm font-display" style={{ fontFamily: 'Cinzel, serif' }}>
                            D{currentVarga.n}
                          </div>
                          <div className="text-stone-200 text-xs">{currentVarga.name}</div>
                        </div>
                      )}
                    </div>
                  );
                }
                const isLagna = signIdx === lagnaSignIdx;
                const planetNames = getPlanetsInSign(result, currentVarga.field, signIdx).filter(
                  (p) => p !== 'Lagna'
                );
                return (
                  <div
                    key={cellI}
                    className={`min-h-[5rem] rounded p-1.5 border ${
                      isLagna
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white/50 border-stone-100'
                    }`}
                  >
                    <div className={`text-xs font-display font-semibold mb-0.5 ${isLagna ? 'text-amber-600' : 'text-stone-400'}`}>
                      {SIGNS_SHORT[signIdx]}
                      {isLagna && <span className="ml-0.5 text-amber-400">✦</span>}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {planetNames.map((p) => (
                        <span key={p} className="text-xs text-stone-600 flex items-center gap-0.5 leading-none">
                          <span className="text-stone-400">{PLANET_EMOJI[p]}</span>
                          <span>{p.slice(0, 3)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // List view
        const houses = Array.from({ length: 12 }, (_, i) => {
          const signIdx = (lagnaSignIdx + i) % 12;
          const houseNum = i + 1;
          const planets = getPlanetsInSign(result, currentVarga.field, signIdx);
          const hasLagna = houseNum === 1;
          const planetNames = planets.filter((p) => p !== 'Lagna');
          const isEmpty = planetNames.length === 0;
          return { signIdx, houseNum, hasLagna, planetNames, isEmpty };
        });

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-5">
            {houses.map(({ signIdx, houseNum, hasLagna, planetNames, isEmpty }) => {
              const sign = SIGNS_FULL[signIdx];
              return (
                <div
                  key={houseNum}
                  className={`flex items-start gap-2 py-1.5 px-2 rounded-lg ${
                    hasLagna || !isEmpty ? 'bg-amber-50/60' : ''
                  }`}
                >
                  <span className={`w-6 text-xs font-display flex-shrink-0 font-semibold ${hasLagna ? 'text-amber-600' : 'text-stone-400'}`}>
                    H{houseNum}
                  </span>
                  <span className={`w-24 text-xs font-body flex-shrink-0 ${hasLagna || !isEmpty ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                    {hasLagna && <span className="text-amber-500 mr-1">✦</span>}
                    {sign}
                  </span>
                  <span className="text-stone-300 text-xs">·</span>
                  <div className="flex flex-wrap gap-1.5 min-h-[1rem]">
                    {!hasLagna && isEmpty ? (
                      <span className="text-stone-300 text-xs">—</span>
                    ) : (
                      <>
                        {hasLagna && (
                          <span className="text-xs text-amber-600 font-semibold font-display">Lagna</span>
                        )}
                        {planetNames.map((p) => (
                          <span key={p} className="text-xs text-stone-700 font-body flex items-center gap-0.5">
                            <span className="text-stone-400">{PLANET_EMOJI[p]}</span>
                            {p}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* AI insight panel */}
      <div className="border-t border-stone-100 pt-4">
        {insight[selectedN] ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-500">✦</span>
              <span
                className="text-sm font-display text-amber-700"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                AI Reading — D{selectedN} {currentVarga.name}
              </span>
              <button
                onClick={() => {
                  setInsight((prev) => { const n = { ...prev }; delete n[selectedN]; return n; });
                }}
                className="ml-auto text-xs text-stone-400 hover:text-stone-600 underline"
              >
                Refresh
              </button>
            </div>
            <div className="text-sm text-stone-700 font-body leading-relaxed whitespace-pre-wrap">
              {insight[selectedN]}
            </div>
          </div>
        ) : error[selectedN] ? (
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-sm">{error[selectedN]}</span>
            <button
              onClick={() => {
                setError((prev) => ({ ...prev, [selectedN]: '' }));
                void fetchInsight(selectedN);
              }}
              className="text-xs text-amber-600 underline"
            >
              Retry
            </button>
          </div>
        ) : loading[selectedN] ? (
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <svg className="animate-spin w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating D{selectedN} {currentVarga.name} reading…
          </div>
        ) : (
          <button
            onClick={() => void fetchInsight(selectedN)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body
              bg-amber-50 border border-amber-200 text-amber-700
              hover:bg-amber-100 hover:border-amber-400 transition-colors"
          >
            <span>✦</span>
            AI Reading for D{selectedN} — {currentVarga.name}
          </button>
        )}
      </div>
    </div>
  );
}
