'use client';

import { useState } from 'react';
import type { ChartResult } from '@/lib/types';

interface AIInsightSectionProps {
  result: ChartResult;
}

export default function AIInsightSection({ result }: AIInsightSectionProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function loadInsight() {
    if (hasLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const data = await res.json() as { insight?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || 'AI request failed');
      setInsight(data.insight || null);
      setHasLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  function formatInsight(text: string) {
    return text.split('\n\n').map((para, i) => (
      <p key={i} className="mb-4 text-stone-700 font-body leading-relaxed text-base">
        {para.split('**').map((chunk, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="text-amber-700 font-semibold">
              {chunk}
            </strong>
          ) : (
            chunk
          )
        )}
      </p>
    ));
  }

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>🤖</span> AI Astrological Reading
        <span className="text-xs text-stone-400 font-body normal-case">
          · Powered by Groq LLaMA 70B
        </span>
      </h3>

      {!hasLoaded && !isLoading && (
        <div className="glass-card-darker rounded-xl p-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-stone-300 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔮</span>
            </div>
            <p className="text-stone-600 text-sm font-body mb-4">
              Get a personalized Vedic astrology reading from AI, analyzing your planetary
              positions, yogas, and panchanga to illuminate your life themes.
            </p>
            <button
              onClick={loadInsight}
              className="btn-gold px-8 py-3 rounded-xl text-sm"
            >
              Generate AI Reading
            </button>
            <p className="text-xs text-stone-400 mt-3 font-body">
              Requires GROQ_API_KEY in .env.local
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="glass-card-darker rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="cosmic-spinner" />
            <p className="text-stone-500 text-sm font-body animate-pulse">
              Consulting the cosmic archives...
            </p>
            <div className="flex gap-2">
              {['Reading planetary positions', 'Analyzing yogas', 'Channeling insights'].map(
                (step, i) => (
                  <span key={i} className="text-xs text-stone-400 font-body">
                    {step}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card-darker rounded-xl p-4 border border-red-200">
          <p className="text-red-600 text-sm font-body mb-2">
            ⚠ AI reading unavailable: {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              setHasLoaded(false);
            }}
            className="btn-ghost px-4 py-1.5 rounded-lg text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {insight && (
        <div className="glass-card-darker rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-3 mb-5 pb-4 border-b border-stone-100">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-amber-700">✦</span>
            </div>
            <div>
              <p className="text-amber-800 text-sm font-display" style={{ fontFamily: 'Cinzel, serif' }}>
                Cosmic Reading for {result.birth_info.name}
              </p>
              <p className="text-xs text-stone-400 font-body">
                {result.ascendant.sign_name} Ascendant · Lahiri Ayanamsa {result.ayanamsa.toFixed(2)}°
              </p>
            </div>
          </div>
          <div className="insight-text">{formatInsight(insight)}</div>
        </div>
      )}
    </div>
  );
}
