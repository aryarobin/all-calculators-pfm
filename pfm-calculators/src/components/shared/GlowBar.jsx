/**
 * Split progress bar: left = invested (muted), right = returns (glowing emerald).
 * pct = returns % of total (0–100).
 */
export default function GlowBar({ pct = 0, leftLabel = 'Invested', rightLabel = 'Returns' }) {
  const safe = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
        <div
          className="h-full rounded-l-full bg-blue-200 transition-all duration-700 ease-out"
          style={{ width: `${100 - safe}%` }}
        />
        <div
          className="h-full rounded-r-full bg-emerald-500 transition-all duration-700 ease-out"
          style={{
            width: `${safe}%`,
            boxShadow: safe > 5 ? '0 0 14px 3px rgba(16,185,129,0.55)' : 'none',
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-semibold mt-1.5 px-0.5">
        <span className="text-blue-400">{leftLabel} {100 - safe}%</span>
        <span className="text-emerald-500">{rightLabel} {safe}%</span>
      </div>
    </div>
  );
}
