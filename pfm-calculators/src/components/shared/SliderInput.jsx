// SliderInput: shows current value + a subtle "What If ±10%" nudge
export default function SliderInput({ label, value, min, max, step = 1, onChange, format, unit = '', prefix = '', hint, whatIfDelta, whatIfLabel }) {
  const displayValue = format ? format(value) : `${prefix}${value.toLocaleString('en-IN')}${unit}`;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-medium text-slate-700 leading-tight">{label}</p>
          {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
        </div>
        <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #1e40af 0%, #1e40af ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}{unit}</span>
        {whatIfDelta && (
          <span className={`font-semibold ${whatIfDelta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {whatIfLabel || '±10%'}: {whatIfDelta > 0 ? '+' : ''}{whatIfDelta}
          </span>
        )}
        <span>{prefix}{max.toLocaleString('en-IN')}{unit}</span>
      </div>
    </div>
  );
}
