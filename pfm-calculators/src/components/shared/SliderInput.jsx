import { useRef } from 'react';

export default function SliderInput({ label, value, min, max, step = 1, onChange, format, unit = '', prefix = '', hint }) {
  const displayValue = format ? format(value) : `${prefix}${value.toLocaleString('en-IN')}${unit}`;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const trackRef = useRef(null);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-slate-700 leading-tight">{label}</p>
          {hint && <p className="text-xs text-slate-400 mt-0.5 leading-tight">{hint}</p>}
        </div>
        <div className="text-[15px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 tabular-nums">
          {displayValue}
        </div>
      </div>
      <div className="relative pt-1" ref={trackRef}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{ background: `linear-gradient(to right,#2563eb 0%,#2563eb ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)` }}
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
          <span>{prefix}{min.toLocaleString('en-IN')}{unit}</span>
          <span>{prefix}{max.toLocaleString('en-IN')}{unit}</span>
        </div>
      </div>
    </div>
  );
}
