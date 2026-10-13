import type { ChartResult, PlanetData } from '@/lib/types';

interface PlanetTableProps {
  result: ChartResult;
}

const SIGNS_SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const SIGNS_FULL = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function dignityBadge(dignity: string) {
  let cls = 'badge-neutral';
  if (dignity.includes('Exalted')) cls = 'badge-exalted';
  else if (dignity.includes('Debilitated')) cls = 'badge-debilitated';
  else if (dignity === 'Own Sign') cls = 'badge-own';
  else if (dignity === 'Moolatrikona') cls = 'badge-moolatrikona';
  const short =
    dignity === 'Exalted (Deep)'
      ? 'Exalt★'
      : dignity === 'Debilitated (Deep)'
      ? 'Debil★'
      : dignity;
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${cls} whitespace-nowrap`}>{short}</span>
  );
}

function avasthaDisplay(avastha: string) {
  if (avastha === 'Neutral') return null;
  const colorMap: Record<string, string> = {
    Garvita:   'text-emerald-600',
    Mudita:    'text-sky-600',
    Lajjita:   'text-orange-600',
    Kshudhita: 'text-amber-600',
    Trushita:  'text-blue-600',
    Kshobhita: 'text-red-600',
  };
  return (
    <span className={`text-xs ${colorMap[avastha] || 'text-orange-600'} font-body`}>
      {avastha}
    </span>
  );
}

interface RowData {
  label: string;
  emoji: string;
  isLagna: boolean;
  planet?: PlanetData;
  lagna?: ChartResult['lagna'];
  arudha?: ChartResult['arudha_lagna'];
}
void ({} as RowData);

export default function PlanetTable({ result }: PlanetTableProps) {
  const { planets, lagna, arudha_lagna, ascendant, graha_yuddha } = result;
  const yuddhaLosers = new Set(graha_yuddha.map((y) => y.loser));
  const yuddhaWinners = new Set(graha_yuddha.map((y) => y.winner));
  const alSign = arudha_lagna.sign;

  const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const lagnaALHouse = ((lagna.d1 - alSign + 12) % 12) + 1;

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>♄</span> Planetary Positions &amp; Divisional Charts
      </h3>
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="vedic-table w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="text-left pl-4">Planet</th>
              <th>D1 Rashi</th>
              <th>Nakshatra · Pada</th>
              <th>D4</th>
              <th>D7</th>
              <th>D9</th>
              <th>D10</th>
              <th>D20</th>
              <th>D27</th>
              <th>D30</th>
              <th>AL</th>
              <th>Dignity</th>
              <th>Avastha</th>
            </tr>
          </thead>
          <tbody>
            {/* Lagna row */}
            <tr className="border-b border-amber-200">
              <td className="text-left pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-display text-sm">Lagna</span>
                  <span className="text-xs text-stone-400">ASC</span>
                </div>
              </td>
              <td>
                <span className="text-amber-700 font-semibold">
                  {SIGNS_FULL[lagna.d1]}
                </span>
                <span className="text-stone-400 text-xs ml-1">
                  {ascendant.degree.toFixed(1)}°
                </span>
              </td>
              <td className="text-stone-600 text-xs">
                {ascendant.nakshatra} · P{ascendant.pada}
                <br />
                <span className="text-stone-400">Lord: {ascendant.nak_lord}</span>
              </td>
              {[lagna.d4, lagna.d7, lagna.d9, lagna.d10, lagna.d20, lagna.d27, lagna.d30].map(
                (s, i) => (
                  <td key={i} className="text-stone-500 text-xs">
                    {SIGNS_SHORT[s]}
                  </td>
                )
              )}
              <td>
                <span className="text-amber-600 text-xs font-semibold">H{lagnaALHouse}</span>
              </td>
              <td>—</td>
              <td>—</td>
            </tr>

            {/* Planet rows */}
            {PLANET_ORDER.map((name) => {
              const p = planets[name];
              if (!p) return null;
              const alHouse = alSign >= 0 ? ((p.sign - alSign + 12) % 12) + 1 : '—';
              const emoji: Record<string, string> = {
                Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
                Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
              };
              const isNode = name === 'Rahu' || name === 'Ketu';
              return (
                <tr key={name} className={isNode ? 'opacity-75' : ''}>
                  <td className="text-left pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 w-4 text-center">{emoji[name]}</span>
                      <span
                        className={`font-body text-sm ${
                          p.is_retrograde ? 'text-red-600' : 'text-stone-800'
                        }`}
                      >
                        {name}
                        {p.is_retrograde && (
                          <sup className="text-red-500 text-xs ml-0.5">R</sup>
                        )}
                      </span>
                      {p.combust && (
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded px-1 py-px leading-none" title={`Combust (${p.combust_orb}° from Sun)`}>Comb</span>
                      )}
                      {yuddhaLosers.has(name) && (
                        <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-1 py-px leading-none" title="Planetary War — Loser">⚔L</span>
                      )}
                      {yuddhaWinners.has(name) && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1 py-px leading-none" title="Planetary War — Winner">⚔W</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-stone-800">{SIGNS_FULL[p.sign]}</span>
                    <span className="text-xs text-stone-400 ml-1">{p.degree.toFixed(1)}°</span>
                    <span className="text-xs text-stone-400 ml-1">H{p.house}</span>
                  </td>
                  <td className="text-stone-600 text-xs">
                    {p.nakshatra} · P{p.pada}
                    <br />
                    <span className="text-stone-400">Lord: {p.nak_lord}</span>
                  </td>
                  {[p.d4, p.d7, p.d9, p.d10, p.d20, p.d27, p.d30].map((s, i) => (
                    <td key={i} className="text-xs text-stone-500">{SIGNS_SHORT[s]}</td>
                  ))}
                  <td>
                    <span className="text-stone-500 text-xs">H{alHouse}</span>
                  </td>
                  <td>{dignityBadge(p.dignity)}</td>
                  <td>{avasthaDisplay(p.avastha) ?? <span className="text-stone-300 text-xs">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-400 mt-2 font-body">
        D4=Chaturthamsha · D7=Saptamsha · D9=Navamsha · D10=Dashamsha · D20=Vimshamsha · D27=Bhamsha · D30=Trimshamsha
        · AL=Arudha Lagna House
        {' · '}
        <span className="text-red-500">R = Retrograde</span>
      </p>
    </div>
  );
}
