import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import WealthContext from '../shared/WealthContext';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcLumpsumYearly, formatINR, calcMultipleTime } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5 text-[13px]">Year {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-8 mb-0.5">
          <span className="text-slate-400">{p.name}</span>
          <span className="font-bold tabular-nums" style={{ color: p.color }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function LumpsumCalculator({ onNavigate }) {
  const [s, set] = useCalcState('lumpsum', { principal: 100000, rate: 12, years: 10 });

  const data = useMemo(() => calcLumpsumYearly(s.principal, s.rate, s.years), [s]);
  const result = data[data.length - 1] || { corpus: 0, invested: s.principal, gains: 0 };

  const doubleYear = useMemo(() => Math.ceil(calcMultipleTime(2, s.rate)), [s.rate]);
  const tripleYear = useMemo(() => Math.ceil(calcMultipleTime(3, s.rate)), [s.rate]);
  const tenXYear   = useMemo(() => Math.ceil(calcMultipleTime(10, s.rate)), [s.rate]);
  const multiple   = (result.corpus / s.principal).toFixed(1);

  return (
    <div className="space-y-4">

      {/* Hero */}
      <HeroCard
        label={`${formatINR(s.principal)} invested once · ${s.rate}% · ${s.years} yrs`}
        value={result.corpus}
        gradient="violet"
        meta={[
          { label: 'Principal', value: formatINR(s.principal) },
          { label: 'Returns',   value: formatINR(result.gains) },
          { label: 'Multiplied', value: `${multiple}×` },
        ]}
      />

      {/* Milestones strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[{ label: '2× Double', year: doubleYear }, { label: '3× Triple', year: tripleYear }, { label: '10×', year: tenXYear }].map(m => (
          <div key={m.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 px-2.5 sm:px-4 py-3 text-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-sm sm:text-base font-black ${m.year <= s.years ? 'text-emerald-600' : 'text-slate-400'}`}>
              {m.year <= 60 ? `Yr ${m.year}` : '60+'}{m.year <= s.years && ' ✓'}
            </p>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
        <SliderInput label="Investment Amount" hint="One-time amount, tap to type any value" value={s.principal} min={10000} max={100000000} step={10000} onChange={v => set({ principal: v })} prefix="₹" />
        <SliderInput label="Expected Annual Return (CAGR)" hint="Nifty 50 20yr avg ~15%, FD ~7%" value={s.rate} min={4} max={30} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        <SliderInput label="Duration" hint="Leave untouched for how long" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Growth trajectory · {s.years} years</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lumpsumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
                <stop offset="90%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            {doubleYear <= s.years && <ReferenceLine x={doubleYear} stroke="#f97316" strokeDasharray="3 3" label={{ value: '2×', fill: '#f97316', fontSize: 10 }} />}
            {tripleYear <= s.years && <ReferenceLine x={tripleYear} stroke="#10b981" strokeDasharray="3 3" label={{ value: '3×', fill: '#10b981', fontSize: 10 }} />}
            <Area type="monotone" dataKey="corpus" name="Future Value" stroke="#7c3aed" strokeWidth={2.5} fill="url(#lumpsumGrad)" dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
            <Area type="monotone" dataKey="invested" name="Principal" stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <WealthContext corpus={result.corpus} />

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Invest monthly instead of one-time' },
        { id: 'cagr', label: 'CAGR Calculator', desc: 'Find the true annual return rate' },
        { id: 'multiplier', label: 'Money Multiplier', desc: 'When does it 2×, 5×, 10×?' },
      ]} />
    </div>
  );
}
