import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function SimpleVsCompound({ onNavigate }) {
  const [s, set] = useCalcState('simplecompound', { principal: 100000, rate: 10, years: 15, freq: 1 });

  const r = useMemo(() => {
    const data = [];
    const n = s.freq; // compounding per year
    for (let y = 0; y <= s.years; y++) {
      const simple = s.principal * (1 + (s.rate / 100) * y);
      const compound = s.principal * Math.pow(1 + s.rate / 100 / n, n * y);
      data.push({ year: y, simple: Math.round(simple), compound: Math.round(compound) });
    }
    const last = data[data.length - 1];
    return { data, simpleFinal: last.simple, compoundFinal: last.compound, diff: last.compound - last.simple };
  }, [s]);

  const FREQ = [{ v: 1, l: 'Yearly' }, { v: 2, l: 'Half-yearly' }, { v: 4, l: 'Quarterly' }, { v: 12, l: 'Monthly' }];

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${formatINR(s.principal)} at ${s.rate}% for ${s.years} years`}
        value={r.diff}
        gradient="indigo"
        sub={`Extra that compounding earns over plain simple interest`}
        meta={[
          { label: 'Simple interest', value: formatINR(r.simpleFinal) },
          { label: 'Compound interest', value: formatINR(r.compoundFinal) },
          { label: 'Compounding bonus', value: `+${r.simpleFinal > 0 ? Math.round(r.diff / r.simpleFinal * 100) : 0}%` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          With <strong>simple interest</strong>, you earn on the principal only — a flat {formatINR(s.principal * s.rate / 100)}/year. With <strong>compound interest</strong>, you earn on your interest too, so the curve bends upward. Over {s.years} years that gap grows to <strong className="text-[#1E1963]">{formatINR(r.diff)}</strong> — this is why every long-term plan should compound.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Inputs</p>
        <SliderInput label="Principal" value={s.principal} min={10000} max={50000000} step={10000} onChange={v => set({ principal: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Interest rate" value={s.rate} min={1} max={25} step={0.5} onChange={v => set({ rate: v })} unit="%" />
          <SliderInput label="Duration" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
        </div>
        <p className="text-sm font-medium text-slate-700 mb-2 mt-1">Compounding frequency</p>
        <div className="grid grid-cols-4 gap-2">
          {FREQ.map(f => (
            <button key={f.v} onClick={() => set({ freq: f.v })}
              className={`px-2 py-2.5 rounded-xl border-2 text-[12px] font-semibold transition-all ${s.freq === f.v ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Simple vs Compound over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Compound</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Simple</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cmpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'compound' ? 'Compound' : 'Simple']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="compound" stroke="#1E1963" strokeWidth={2.5} fill="url(#cmpGrad)" dot={false} />
            <Area type="monotone" dataKey="simple" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Compounding with monthly investing' },
        { id: 'multiplier', label: 'Money Multiplier', desc: 'When compounding 2× / 10× your money' },
        { id: 'cagr', label: 'CAGR Calculator', desc: 'The true compounded growth rate' },
      ]} />
    </div>
  );
}
