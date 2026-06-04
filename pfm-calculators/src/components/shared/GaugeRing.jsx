import { useAnimatedValue } from '../../hooks/useAnimatedValue';

/**
 * Animated circular progress ring.
 * props: pct (0-100), label, sublabel, size, color (auto by pct if omitted)
 */
export default function GaugeRing({ pct = 0, label, sublabel, size = 120, color }) {
  const animated = useAnimatedValue(Math.round(Math.max(0, Math.min(100, pct))), 700);
  const stroke = 10;
  const r = (100 - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - animated / 100);

  // Brand semantic scale: Pigment Green → Harvest Gold → Imperial Red
  const autoColor =
    animated >= 90 ? '#3EA23C' :
    animated >= 60 ? '#CA8D1B' :
    animated >= 30 ? '#E6A125' : '#E33434';
  const ringColor = color || autoColor;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tabular-nums" style={{ color: ringColor }}>{animated}%</span>
          {sublabel && <span className="text-[10px] text-slate-400 font-semibold">{sublabel}</span>}
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-slate-500 mt-2 text-center">{label}</p>}
    </div>
  );
}
