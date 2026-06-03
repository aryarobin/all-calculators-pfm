import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { formatINR } from '../../utils/financialCalc';

/**
 * Premium gradient hero card with animated counter.
 * gradient: Tailwind from-X to-Y classes, or 'dark'/'success'/'warning'
 */
const GRADIENTS = {
  blue:    'from-blue-600 to-blue-800',
  indigo:  'from-indigo-600 to-violet-700',
  emerald: 'from-emerald-500 to-teal-700',
  slate:   'from-slate-700 to-slate-900',
  amber:   'from-amber-500 to-orange-600',
  rose:    'from-rose-500 to-red-700',
  violet:  'from-violet-600 to-purple-800',
  cyan:    'from-cyan-500 to-blue-700',
};

export default function HeroCard({
  label,
  value,          // numeric, gets animated + formatted as INR
  rawValue,       // if provided, shows this string instead (no animation)
  sub,
  meta,           // array of {label, value} — small stats below the hero
  gradient = 'blue',
  compact = false,
}) {
  const animated   = useAnimatedValue(typeof value === 'number' ? Math.round(value) : 0);
  const gradClass  = GRADIENTS[gradient] ?? gradient;
  const displayVal = rawValue ?? formatINR(animated);

  return (
    <div className={`relative bg-gradient-to-br ${gradClass} rounded-2xl text-white overflow-hidden shadow-lg`}>
      {/* Decorative orb — gives depth */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-black/10 blur-2xl" />

      <div className={compact ? 'px-5 py-4 relative' : 'px-6 py-6 relative'}>
        <p className={`font-bold uppercase tracking-widest text-white/60 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {label}
        </p>

        <p className={`font-black leading-none tracking-tight tabular-nums ${compact ? 'text-3xl' : 'text-6xl sm:text-7xl'}`}>
          {displayVal}
        </p>

        {sub && (
          <p className={`mt-1.5 text-white/55 ${compact ? 'text-xs' : 'text-sm'}`}>{sub}</p>
        )}

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-white/15">
            {meta.map(m => (
              <div key={m.label}>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{m.label}</p>
                <p className="text-base font-bold tabular-nums mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
