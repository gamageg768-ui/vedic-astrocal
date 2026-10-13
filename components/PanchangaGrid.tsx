import type { Panchanga } from '@/lib/types';

interface PanchangaGridProps {
  panchanga: Panchanga;
}

interface PanchangaCardProps {
  icon: string;
  title: string;
  main: string;
  sub: string;
  completion?: number;
  extra?: string;
}

function PanchangaCard({ icon, title, main, sub, completion, extra }: PanchangaCardProps) {
  return (
    <div className="glass-card-darker rounded-xl p-4 flex flex-col gap-2 hover:border-stone-300 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-display text-stone-400 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div>
        <p className="text-amber-700 font-display text-base font-semibold leading-tight">{main}</p>
        <p className="text-stone-600 text-xs mt-0.5 font-body">{sub}</p>
        {extra && (
          <p className="text-stone-500 text-xs mt-0.5 font-body italic">{extra}</p>
        )}
      </div>
      {completion !== undefined && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-400">Completion</span>
            <span className="text-xs text-stone-500">{completion.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
              style={{ width: `${Math.min(completion, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanchangaGrid({ panchanga }: PanchangaGridProps) {
  return (
    <div>
      <h3
        className="font-display text-lg text-amber-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        <span>☽</span> Panchanga
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <PanchangaCard
          icon="☉"
          title="Vara (Weekday)"
          main={panchanga.vara.name}
          sub={`Day ${panchanga.vara.number} of week`}
        />
        <PanchangaCard
          icon="🌙"
          title="Tithi"
          main={panchanga.tithi.name}
          sub={panchanga.tithi.paksha}
          completion={panchanga.tithi.completion}
          extra={`#${panchanga.tithi.number}`}
        />
        <PanchangaCard
          icon="⭐"
          title="Nakshatra"
          main={panchanga.nakshatra.name}
          sub={`Pada ${panchanga.nakshatra.pada} · Lord: ${panchanga.nakshatra.lord}`}
        />
        <PanchangaCard
          icon="☯"
          title="Yoga"
          main={panchanga.yoga.name}
          sub={`Yoga #${panchanga.yoga.number}`}
          completion={panchanga.yoga.completion}
        />
        <PanchangaCard
          icon="⚖"
          title="Karana"
          main={panchanga.karana.name}
          sub={`Karana #${panchanga.karana.number}`}
          completion={panchanga.karana.completion}
        />
      </div>
    </div>
  );
}
