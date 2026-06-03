import { useState, useRef } from 'react';

// Parse Indian-format number strings: "5L", "2.5Cr", "50000", "1,00,000"
function parseInput(raw) {
  const s = raw.replace(/,/g, '').trim().toLowerCase();
  const num = parseFloat(s);
  if (isNaN(num)) return null;
  if (s.endsWith('cr')) return Math.round(num * 1e7);
  if (s.endsWith('l'))  return Math.round(num * 1e5);
  if (s.endsWith('k'))  return Math.round(num * 1e3);
  return Math.round(num);
}

export default function SliderInput({
  label, value, min, max, step = 1,
  onChange, format, unit = '', prefix = '', hint,
  // Allow values beyond the slider max by typing
  hardMax,   // absolute ceiling (defaults to max * 10 or Infinity)
  hardMin,   // absolute floor  (defaults to min)
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw]         = useState('');
  const inputRef              = useRef(null);

  const ceiling = hardMax ?? Math.max(max * 5, max + 1);
  const floor   = hardMin ?? min;

  const displayValue = format
    ? format(value)
    : `${prefix}${value.toLocaleString('en-IN')}${unit}`;

  const pct = Math.max(0, Math.min(100, ((Math.min(value, max) - min) / (max - min)) * 100));
  // If value > max, pin thumb to end and indicate overflow
  const overflow = value > max;

  function commitEdit() {
    const parsed = parseInput(raw);
    if (parsed !== null) {
      const clamped = Math.max(floor, Math.min(ceiling, parsed));
      onChange(clamped);
    }
    setEditing(false);
    setRaw('');
  }

  function startEdit() {
    setRaw(value.toString());
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-slate-700 leading-tight">{label}</p>
          {hint && <p className="text-xs text-slate-400 mt-0.5 leading-tight">{hint}</p>}
        </div>

        {/* Value badge — tap to type */}
        {editing ? (
          <input
            ref={inputRef}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
            placeholder={`e.g. ${prefix}${max.toLocaleString('en-IN')}${unit}`}
            className="w-32 text-right text-sm font-bold text-blue-700 bg-blue-50 border-2 border-blue-400 px-2.5 py-1.5 rounded-lg focus:outline-none tabular-nums"
          />
        ) : (
          <button
            onClick={startEdit}
            title="Tap to type any value"
            className={`text-[15px] font-bold px-3 py-1.5 rounded-lg border whitespace-nowrap tabular-nums transition-colors active:scale-95 ${
              overflow
                ? 'text-violet-700 bg-violet-50 border-violet-200'
                : 'text-blue-700 bg-blue-50 border-blue-100 hover:border-blue-300'
            }`}
          >
            {displayValue}
            {overflow && <span className="ml-1 text-[10px] text-violet-500">▲</span>}
          </button>
        )}
      </div>

      {/* Track */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
          }}
        />
        {overflow && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow" />
        )}
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium px-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}{unit}</span>
        <span className="text-slate-300 text-[10px]">tap value to type</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{unit}</span>
      </div>
    </div>
  );
}
