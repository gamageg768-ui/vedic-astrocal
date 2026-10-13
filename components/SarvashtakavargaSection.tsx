import type { ChartResult } from '@/lib/types';

const SIGNS_SHORT = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

function scoreStyle(score: number, max: number): string {
  const r = score / max;
  if (r >= 0.75) return 'text-emerald-700 font-semibold bg-emerald-50';
  if (r >= 0.5)  return 'text-amber-600 bg-amber-50/60';
  if (r >= 0.25) return 'text-stone-500';
  return 'text-red-400 bg-red-50/40';
}

export default function SarvashtakavargaSection({ result }: { result: ChartResult }) {
  const { sarvashtakavarga } = result;
  const grandTotal = sarvashtakavarga.sarva.reduce((a, b) => a + b, 0);

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-1 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>⬡</span> Sarvashtakavarga
      </h3>
      <p className="text-xs text-stone-400 font-body mb-4">
        Ashtakavarga bindu scores per sign — higher = more favorable transit activity through that sign
      </p>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs font-body min-w-[580px]">
          <thead>
            <tr>
              <th className="text-left py-1.5 pr-3 w-20 text-stone-400 font-display uppercase tracking-wide">Planet</th>
              {SIGNS_SHORT.map((s) => (
                <th key={s} className="text-center py-1.5 text-stone-400 font-display w-9">{s}</th>
              ))}
              <th className="text-center py-1.5 text-stone-500 font-display w-9">∑</th>
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((planet) => {
              const scores = sarvashtakavarga.planets[planet] ?? (new Array(12).fill(0) as number[]);
              const total = scores.reduce((a, b) => a + b, 0);
              return (
                <tr key={planet} className="border-t border-stone-50">
                  <td className="py-1.5 pr-3 text-stone-600 font-semibold whitespace-nowrap">{planet}</td>
                  {scores.map((s, i) => (
                    <td key={i} className={`text-center py-1 rounded ${scoreStyle(s, 8)}`}>{s}</td>
                  ))}
                  <td className="text-center py-1.5 text-stone-500 font-semibold">{total}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-amber-200">
              <td className="py-2 pr-3 text-amber-700 font-display font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                Sarva
              </td>
              {sarvashtakavarga.sarva.map((s, i) => (
                <td key={i} className={`text-center py-1.5 font-bold rounded ${scoreStyle(s, 56)}`}>{s}</td>
              ))}
              <td className="text-center py-2 text-amber-700 font-bold">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-400 font-body">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
          Strong (≥6 per planet, ≥42 sarva)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
          Average (4–5 / 28–41)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-50 border border-red-200" />
          Weak (≤2 / ≤14)
        </span>
      </div>
    </div>
  );
}
