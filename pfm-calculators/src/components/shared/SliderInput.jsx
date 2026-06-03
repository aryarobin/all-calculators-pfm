export default function SliderInput({ label, value, min, max, step = 1, onChange, format, unit = '', prefix = '', hint }) {
  const displayValue = format ? format(value) : `${prefix}${value.toLocaleString('en-IN')}${unit}`;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
        </div>
        <div className="text-xl font-bold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-xl border border-orange-100">
          {displayValue}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #f97316 0%, #f97316 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}{unit}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{unit}</span>
      </div>
    </div>
  );
}
