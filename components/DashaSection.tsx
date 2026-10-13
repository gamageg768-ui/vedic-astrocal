'use client';

import { useState } from 'react';
import type { ChartResult, MahaDasha } from '@/lib/types';

const PLANET_COLOR: Record<string, string> = {
  Sun:     'bg-amber-400',
  Moon:    'bg-slate-300',
  Mars:    'bg-red-400',
  Rahu:    'bg-violet-500',
  Jupiter: 'bg-yellow-400',
  Saturn:  'bg-stone-400',
  Mercury: 'bg-emerald-400',
  Ketu:    'bg-orange-300',
  Venus:   'bg-pink-300',
};

const PLANET_TEXT: Record<string, string> = {
  Sun:     'text-amber-700',
  Moon:    'text-slate-600',
  Mars:    'text-red-700',
  Rahu:    'text-violet-700',
  Jupiter: 'text-yellow-700',
  Saturn:  'text-stone-600',
  Mercury: 'text-emerald-700',
  Ketu:    'text-orange-700',
  Venus:   'text-pink-600',
};

interface Props { result: ChartResult }

function formatDateRange(start: string, end: string): string {
  return `${start.slice(0, 7)} → ${end.slice(0, 7)}`;
}

function isCurrentPeriod(start: string, end: string): boolean {
  const now = new Date().toISOString().split('T')[0];
  return start <= now && now < end;
}

export default function DashaSection({ result }: Props) {
  const { dashas } = result;
  const currentMD = dashas.find((d) => isCurrentPeriod(d.start, d.end));
  const [expanded, setExpanded] = useState<string | null>(currentMD?.lord ?? null);
  const [expandedAD, setExpandedAD] = useState<string | null>(null);

  const totalMs = 120 * 365.25 * 24 * 3600 * 1000;
  const cycleStart = new Date(dashas[0].start).getTime();

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-1 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>⏳</span> Vimshottari Dasha
      </h3>
      <p className="text-xs text-stone-400 font-body mb-4">120-year planetary period cycle based on Moon's nakshatra</p>

      {/* Timeline bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-1 w-full">
        {dashas.map((d) => {
          const widthPct = (d.years / 120) * 100;
          const isCurrent = isCurrentPeriod(d.start, d.end);
          return (
            <div
              key={d.lord}
              title={`${d.lord} (${d.years}y): ${d.start} → ${d.end}`}
              style={{ width: `${widthPct}%` }}
              className={`${PLANET_COLOR[d.lord] ?? 'bg-stone-300'} ${isCurrent ? 'ring-2 ring-inset ring-white' : 'opacity-60'} cursor-pointer transition-opacity hover:opacity-100`}
              onClick={() => setExpanded(expanded === d.lord ? null : d.lord)}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-stone-400 font-body mb-5">
        <span>{dashas[0].start.slice(0, 7)}</span>
        <span>{dashas[8].end.slice(0, 7)}</span>
      </div>

      {/* Dasha rows */}
      <div className="space-y-1">
        {dashas.map((d) => {
          const isCurrent = isCurrentPeriod(d.start, d.end);
          const isOpen = expanded === d.lord;
          const startMs = new Date(d.start).getTime();
          const leftPct = ((startMs - cycleStart) / totalMs) * 100;
          const widthPct = (d.years / 120) * 100;
          const currentAD = d.antardashas.find((ad) => isCurrentPeriod(ad.start, ad.end));

          return (
            <div key={d.lord + d.start} className={`rounded-xl border transition-colors ${isCurrent ? 'border-amber-300 bg-amber-50/60' : 'border-stone-100 bg-white/40'}`}>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left"
                onClick={() => setExpanded(isOpen ? null : d.lord)}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PLANET_COLOR[d.lord] ?? 'bg-stone-300'}`} />
                <span className={`font-display text-sm font-semibold w-20 flex-shrink-0 ${PLANET_TEXT[d.lord] ?? 'text-stone-700'}`} style={{ fontFamily: 'Cinzel, serif' }}>
                  {d.lord}
                </span>
                <span className="text-xs text-stone-400 font-body flex-shrink-0 w-14">{d.years}y</span>
                <span className="text-xs text-stone-500 font-body flex-1">{formatDateRange(d.start, d.end)}</span>
                {isCurrent && (
                  <span className="text-xs bg-amber-100 border border-amber-300 text-amber-700 rounded-full px-2 py-0.5 font-display flex-shrink-0">
                    Current {currentAD ? `/ ${currentAD.lord} AD` : ''}
                  </span>
                )}
                <span className="text-stone-300 text-xs">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Mini progress bar inside dasha */}
              <div className="px-3 pb-1">
                <div className="h-0.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${PLANET_COLOR[d.lord] ?? 'bg-stone-300'} opacity-50`}
                    style={{ width: `${widthPct}%`, marginLeft: `${leftPct}%` }}
                  />
                </div>
              </div>

              {/* Antardasha expansion */}
              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-stone-100 space-y-1">
                  {d.antardashas.map((ad) => {
                    const adCurrent = isCurrentPeriod(ad.start, ad.end);
                    const adKey = d.lord + ad.lord + ad.start;
                    const adOpen = expandedAD === adKey;
                    return (
                      <div key={adKey} className={`rounded-lg border ${adCurrent ? 'border-amber-200 bg-amber-50' : 'border-stone-100 bg-stone-50/60'}`}>
                        <button
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs"
                          onClick={() => setExpandedAD(adOpen ? null : adKey)}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PLANET_COLOR[ad.lord] ?? 'bg-stone-300'}`} />
                          <span className={`font-display font-semibold w-16 flex-shrink-0 ${PLANET_TEXT[ad.lord] ?? 'text-stone-600'}`} style={{ fontFamily: 'Cinzel, serif' }}>
                            {ad.lord}
                          </span>
                          <span className="text-stone-400 flex-1">{ad.start.slice(0, 7)} → {ad.end.slice(0, 7)}</span>
                          {adCurrent && <span className="text-amber-600 font-semibold mr-1">●</span>}
                          <span className="text-stone-300">{adOpen ? '▲' : '▼'}</span>
                        </button>
                        {adOpen && (
                          <div className="px-2 pb-2 border-t border-stone-100">
                            <p className="text-xs text-stone-400 mb-1.5 pt-1 font-display" style={{ fontFamily: 'Cinzel, serif' }}>Pratyantardasha</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5">
                              {ad.pratyantardashas.map((pd) => {
                                const pdCurrent = isCurrentPeriod(pd.start, pd.end);
                                return (
                                  <div
                                    key={pd.lord + pd.start}
                                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded text-xs ${pdCurrent ? 'bg-amber-100 border border-amber-200' : ''}`}
                                  >
                                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${PLANET_COLOR[pd.lord] ?? 'bg-stone-300'}`} />
                                    <span className={`font-semibold w-12 flex-shrink-0 ${PLANET_TEXT[pd.lord] ?? 'text-stone-500'}`}>{pd.lord}</span>
                                    <span className="text-stone-400 text-xs">{pd.start.slice(0, 10)} → {pd.end.slice(0, 10)}</span>
                                    {pdCurrent && <span className="text-amber-500 ml-auto">●</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-3 font-body">Click row → Antardashas · Click Antardasha → Pratyantardashas · Highlighted = current period</p>
    </div>
  );
}
