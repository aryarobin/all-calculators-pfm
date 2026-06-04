import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { formatINR } from '../../utils/financialCalc';

// GoalFi brand gradients (Brand Book 2023): Federal Blue, Penn Blue, Marian
// Blue, Harvest Gold, plus semantic Pigment Green / Imperial Red.
const GRADIENTS = {
  blue:    'from-[#1E1963] to-[#030338]',   // Federal → Penn (default brand)
  indigo:  'from-[#334BA0] to-[#1E1963]',   // Marian → Federal
  violet:  'from-[#1E1963] to-[#030338]',   // brand blue
  cyan:    'from-[#334BA0] to-[#030338]',   // Marian → Penn
  emerald: 'from-[#3EA23C] to-[#1E5e3a]',   // Pigment Green (positive)
  slate:   'from-[#18181C] to-[#030338]',   // Ink → Penn (sophisticated dark)
  amber:   'from-[#CA8D1B] to-[#8a5e10]',   // Harvest Gold (caution / gold moment)
  rose:    'from-[#E33434] to-[#8a1f1f]',   // Imperial Red (warning)
};

export default function HeroCard({
  label,
  value,          // numeric — animated + formatted as INR
  rawValue,       // string override (no animation)
  sub,
  meta,           // array of {label, value}
  gradient = 'blue',
  compact = false,
}) {
  const animated   = useAnimatedValue(typeof value === 'number' ? Math.round(value) : 0);
  const gradClass  = GRADIENTS[gradient] ?? gradient;
  const displayVal = rawValue ?? formatINR(animated);

  // Scale font down for longer strings so nothing clips on small phones
  const len = String(displayVal).length;
  const sizeClass = compact
    ? 'text-2xl sm:text-3xl'
    : len > 13
      ? 'text-[28px] sm:text-4xl md:text-5xl'
      : len > 10
        ? 'text-4xl sm:text-5xl md:text-6xl'
        : 'text-5xl sm:text-6xl md:text-7xl';

  return (
    <div className={`relative bg-gradient-to-br ${gradClass} rounded-2xl text-white overflow-hidden shadow-lg`}>
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-black/10 blur-2xl" />

      <div className={`relative ${compact ? 'px-4 py-4 sm:px-5' : 'px-5 py-5 sm:px-6 sm:py-6'}`}>
        <p className={`font-bold uppercase tracking-widest text-white/60 mb-1.5 ${compact ? 'text-[10px]' : 'text-[10px] sm:text-xs'}`}>
          {label}
        </p>

        <p className={`font-black leading-[1.05] tracking-tight tabular-nums break-words ${sizeClass}`}>
          {displayVal}
        </p>

        {sub && (
          <p className={`mt-1.5 text-white/55 ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>{sub}</p>
        )}

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-3 mt-4 pt-4 border-t border-white/15">
            {meta.map(m => (
              <div key={m.label} className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider font-semibold leading-tight">{m.label}</p>
                <p className="text-sm sm:text-base font-bold tabular-nums mt-0.5 truncate">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
