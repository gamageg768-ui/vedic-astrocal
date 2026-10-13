'use client';

import { useState } from 'react';
import InputForm from './InputForm';
import ResultsView from './ResultsView';
import type { ChartResult, BirthDetails } from '@/lib/types';

export default function AstroApp() {
  const [result, setResult] = useState<ChartResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: BirthDetails) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json() as ChartResult & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Calculation failed');
      }
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen">
      {result ? (
        <ResultsView result={result} onReset={handleReset} />
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          {/* Hero */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center animate-float shadow-md">
                  <span className="text-3xl">🪐</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center">
                  <span className="text-xs text-amber-700">✦</span>
                </div>
              </div>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-display font-semibold gold-shimmer mb-3"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Vedic Birth Chart
            </h2>
            <p className="text-stone-600 text-base sm:text-lg font-body max-w-md mx-auto">
              Precise sidereal calculations with AI-powered astrological insights
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                No sign-in required
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Lahiri Ayanamsa
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                AI Insights
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <div>
                  <p className="font-semibold mb-1">Calculation Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
