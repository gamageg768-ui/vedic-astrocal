import type { YogaResult } from '@/lib/types';

interface YogasSectionProps {
  yogas: YogaResult[];
}

const YOGA_ICONS: Record<string, string> = {
  'Gajakesari Yoga': '🐘',
  'Budhaditya Yoga': '☿',
  'Ruchaka Yoga': '⚔️',
  'Bhadra Yoga': '📚',
  'Hamsa Yoga': '🦢',
  'Malavya Yoga': '💎',
  'Shasha Yoga': '⏳',
  'Chandra Mangala Yoga': '🌙',
  'Guru Mangala Yoga': '⚡',
};

function getYogaIcon(name: string): string {
  for (const [key, icon] of Object.entries(YOGA_ICONS)) {
    if (name.includes(key.replace(' Yoga', '').split(' ')[0])) return icon;
  }
  return '✦';
}

export default function YogasSection({ yogas }: YogasSectionProps) {
  if (yogas.length === 0) {
    return (
      <div>
        <h3
          className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          <span>✦</span> Active Yogas
        </h3>
        <div className="glass-card-darker rounded-xl p-6 text-center">
          <p className="text-stone-500 font-body text-sm">
            No prominent yogas detected in this chart configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>✦</span> Active Yogas
        <span className="text-xs text-stone-400 font-body normal-case ml-1">
          ({yogas.length} detected)
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {yogas.map((yoga, i) => (
          <div
            key={i}
            className="glass-card-darker rounded-xl p-4 hover:border-amber-300 transition-all duration-300"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
                {getYogaIcon(yoga.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4
                    className="font-display text-sm text-amber-800 font-semibold leading-tight"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {yoga.name}
                  </h4>
                  <div className="flex gap-0.5 flex-shrink-0" title={`Strength: ${yoga.strength}/5`}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-xs ${s <= yoga.strength ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-1.5 font-body">
                  Planets:{' '}
                  <span className="text-stone-700">{yoga.planets.join(' + ')}</span>
                </p>
                <p className="text-xs text-stone-600 font-body leading-relaxed italic">
                  {yoga.effect}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
