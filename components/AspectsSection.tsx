import type { ChartResult } from '@/lib/types';

interface Props { result: ChartResult }

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_EMOJI: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const ASPECT_LABEL: Record<string, string> = {
  '7': '7th',
  '4': '4th★', '8': '8th★',
  '5': '5th★', '9': '9th★',
  '3': '3rd★', '10': '10th★',
};

function getAspectType(planetName: string, offset: number): 'normal' | 'special' {
  const special: Record<string, number[]> = {
    Mars: [4, 8], Jupiter: [5, 9], Saturn: [3, 10], Rahu: [5, 9], Ketu: [5, 9],
  };
  return (special[planetName] ?? []).includes(offset) ? 'special' : 'normal';
}

export default function AspectsSection({ result }: Props) {
  const { aspects, planets } = result;
  const houses = Array.from({ length: 12 }, (_, i) => i + 1);

  // Build a map: house -> list of aspecting planets
  const houseAspectors: Record<number, Array<{ name: string; type: 'normal' | 'special' }>> = {};
  for (const h of houses) houseAspectors[h] = [];

  for (const name of PLANET_ORDER) {
    const p = planets[name];
    if (!p) continue;
    for (const h of (aspects[name] ?? [])) {
      const offset = ((h - p.house + 12) % 12) || 12;
      houseAspectors[h].push({ name, type: getAspectType(name, offset) });
    }
  }

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-1 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>◉</span> Graha Drishti — Planetary Aspects
      </h3>
      <p className="text-xs text-stone-400 font-body mb-4">
        All planets aspect 7th house · Mars: 4th, 8th · Jupiter: 5th, 9th · Saturn: 3rd, 10th · ★ = special aspect
      </p>

      {/* Planet → Houses grid */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 mb-6">
        <table className="vedic-table w-full min-w-[720px] text-xs">
          <thead>
            <tr>
              <th className="text-left pl-4 w-32">Planet</th>
              {houses.map((h) => <th key={h} className="w-10">H{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {PLANET_ORDER.map((name) => {
              const p = planets[name];
              if (!p) return null;
              const aspected = new Set(aspects[name] ?? []);
              return (
                <tr key={name}>
                  <td className="text-left pl-4 py-1.5">
                    <span className="text-stone-400 mr-1">{PLANET_EMOJI[name]}</span>
                    <span className="text-stone-700 font-body">{name}</span>
                    <span className="text-stone-400 ml-1">H{p.house}</span>
                  </td>
                  {houses.map((h) => {
                    const isOwn = h === p.house;
                    const isAspected = aspected.has(h);
                    const offset = ((h - p.house + 12) % 12) || 12;
                    const isSpecial = isAspected && getAspectType(name, offset) === 'special';
                    return (
                      <td key={h} className="text-center py-1.5">
                        {isOwn ? (
                          <span className="text-amber-500 font-semibold">●</span>
                        ) : isSpecial ? (
                          <span className="text-indigo-600 font-bold">◆</span>
                        ) : isAspected ? (
                          <span className="text-stone-600">◉</span>
                        ) : (
                          <span className="text-stone-200">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* House-centric view */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {houses.map((h) => {
          const aspectors = houseAspectors[h];
          const occupied = PLANET_ORDER.filter((n) => planets[n]?.house === h);
          return (
            <div key={h} className={`rounded-xl border p-3 ${aspectors.length > 0 || occupied.length > 0 ? 'border-stone-200 bg-amber-50/40' : 'border-stone-100 bg-white/20'}`}>
              <div className="text-xs font-display font-semibold text-amber-700 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
                House {h}
              </div>
              {occupied.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {occupied.map((n) => (
                    <span key={n} className="text-xs text-amber-600 font-body">
                      {PLANET_EMOJI[n]}{n}
                    </span>
                  ))}
                </div>
              )}
              {aspectors.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {aspectors.map(({ name, type }) => (
                    <span
                      key={name}
                      className={`text-xs px-1 rounded ${type === 'special' ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-stone-500 bg-stone-50 border border-stone-100'}`}
                    >
                      {PLANET_EMOJI[name]}{name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-stone-300">No aspects</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-2 font-body">● Occupied · ◉ Normal aspect · ◆ Special aspect</p>
    </div>
  );
}
