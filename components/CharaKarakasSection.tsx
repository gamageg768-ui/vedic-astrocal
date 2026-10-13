import type { ChartResult } from '@/lib/types';

interface Props { result: ChartResult }

const PLANET_EMOJI: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

const KARAKA_DESC: Record<string, string> = {
  Atmakaraka:    'Soul significator — life purpose, dharma, deepest desires',
  Amatyakaraka:  'Career & mind significator — profession, counsel',
  Bhratrukaraka: 'Siblings, courage, younger co-born',
  Matrukaraka:   'Mother, home, emotional foundations',
  Putrakaraka:   'Children, creativity, intelligence, disciples',
  Gnatikaraka:   'Competition, conflict, disease, relatives',
  Darakaraka:    'Spouse, partnerships, desires of others',
};

const KARAKA_COLOR: Record<string, string> = {
  Atmakaraka:    'bg-amber-100 border-amber-300 text-amber-800',
  Amatyakaraka:  'bg-sky-100 border-sky-300 text-sky-800',
  Bhratrukaraka: 'bg-red-100 border-red-200 text-red-800',
  Matrukaraka:   'bg-emerald-100 border-emerald-200 text-emerald-800',
  Putrakaraka:   'bg-yellow-100 border-yellow-200 text-yellow-800',
  Gnatikaraka:   'bg-stone-100 border-stone-200 text-stone-700',
  Darakaraka:    'bg-pink-100 border-pink-200 text-pink-800',
};

export default function CharaKarakasSection({ result }: Props) {
  const { chara_karakas, graha_yuddha } = result;

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-1 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>♃</span> Jaimini Chara Karakas
      </h3>
      <p className="text-xs text-stone-400 font-body mb-4">
        Planets ranked by degree within sign (descending) — each becomes a life-area significator
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
        {chara_karakas.map((ck) => (
          <div
            key={ck.karaka}
            className={`rounded-xl border p-3 ${KARAKA_COLOR[ck.karaka] ?? 'bg-stone-100 border-stone-200 text-stone-700'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                {ck.short}
              </span>
              <span className="text-lg">{PLANET_EMOJI[ck.planet]}</span>
            </div>
            <div className="font-display text-sm font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
              {ck.planet}
            </div>
            <div className="text-xs opacity-70 font-body mb-1">{ck.degree.toFixed(2)}° in sign</div>
            <div className="text-xs font-semibold font-body">{ck.karaka}</div>
          </div>
        ))}
      </div>

      <table className="w-full text-xs font-body">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="text-left py-1.5 pr-4 text-stone-500 font-semibold w-8">Rank</th>
            <th className="text-left py-1.5 pr-4 text-stone-500 font-semibold">Planet</th>
            <th className="text-left py-1.5 pr-4 text-stone-500 font-semibold">Degree</th>
            <th className="text-left py-1.5 pr-4 text-stone-500 font-semibold">Karaka</th>
            <th className="text-left py-1.5 text-stone-500 font-semibold">Signifies</th>
          </tr>
        </thead>
        <tbody>
          {chara_karakas.map((ck, i) => (
            <tr key={ck.karaka} className="border-b border-stone-100">
              <td className="py-1.5 pr-4 text-stone-400">{i + 1}</td>
              <td className="py-1.5 pr-4 font-semibold text-stone-700">
                {PLANET_EMOJI[ck.planet]} {ck.planet}
              </td>
              <td className="py-1.5 pr-4 text-stone-500">{ck.degree.toFixed(2)}°</td>
              <td className="py-1.5 pr-4">
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${KARAKA_COLOR[ck.karaka] ?? ''}`}>
                  {ck.short} — {ck.karaka}
                </span>
              </td>
              <td className="py-1.5 text-stone-500">{KARAKA_DESC[ck.karaka]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {graha_yuddha.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-100">
          <h4 className="font-display text-sm text-amber-700 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
            ⚔ Graha Yuddha (Planetary War)
          </h4>
          <div className="space-y-2">
            {graha_yuddha.map((y) => (
              <div key={y.p1 + y.p2} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-600 font-display font-semibold text-sm" style={{ fontFamily: 'Cinzel, serif' }}>
                  {PLANET_EMOJI[y.p1]} {y.p1} vs {PLANET_EMOJI[y.p2]} {y.p2}
                </span>
                <span className="text-stone-400 text-xs">·</span>
                <span className="text-emerald-700 text-xs font-semibold">Winner: {y.winner}</span>
                <span className="text-red-600 text-xs font-semibold">Loser: {y.loser}</span>
                <span className="ml-auto text-xs text-stone-400 font-body">Loser's significations are weakened</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
