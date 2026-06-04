import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function RealReturn({ onNavigate }) {
  const [s, set] = useCalcState('realreturn', {
    amount: 1000000, nominal: 12, taxRate: 12.5, inflation: 6, years: 15,
  });

  const r = useMemo(() => {
    // Post-tax nominal return (tax applies to the gain portion each year — a
    // reasonable simplification: shave the return by the tax rate).
    const postTaxNominal = s.nominal * (1 - s.taxRate / 100);
    // Real return = how fast purchasing power actually grows.
    const realReturn = ((1 + postTaxNominal / 100) / (1 + s.inflation / 100) - 1) * 100;

    const nominalFV = s.amount * Math.pow(1 + s.nominal / 100, s.years);
    const postTaxFV = s.amount * Math.pow(1 + postTaxNominal / 100, s.years);
    // Real FV = post-tax value expressed in TODAY's rupees (purchasing power).
    const realFV = postTaxFV / Math.pow(1 + s.inflation / 100, s.years);

    const data = [];
    for (let y = 0; y <= s.years; y++) {
      const ptv = s.amount * Math.pow(1 + postTaxNominal / 100, y);
      data.push({
        year: y,
        nominal: Math.round(s.amount * Math.pow(1 + s.nominal / 100, y)),
        real: Math.round(ptv / Math.pow(1 + s.inflation / 100, y)),
      });
    }
    return { postTaxNominal, realReturn, nominalFV, postTaxFV, realFV, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Your real return after tax and inflation`}
        value={Math.round(r.realReturn * 10) / 10}
        rawValue={`${r.realReturn.toFixed(1)}%`}
        gradient={r.realReturn >= 4 ? 'emerald' : r.realReturn >= 0 ? 'amber' : 'rose'}
        sub={`You see ${s.nominal}% on paper — but you keep ${r.postTaxNominal.toFixed(1)}% after tax, and only ${r.realReturn.toFixed(1)}% in real buying power`}
        meta={[
          { label: 'Headline return', value: `${s.nominal}%` },
          { label: 'After tax', value: `${r.postTaxNominal.toFixed(1)}%` },
          { label: 'After inflation', value: `${r.realReturn.toFixed(1)}%` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          The return your fund advertises isn't what you actually gain. A <strong>{s.nominal}%</strong> headline becomes <strong>{r.postTaxNominal.toFixed(1)}%</strong> once tax takes its cut, and just <strong className={r.realReturn >= 0 ? 'text-[#3EA23C]' : 'text-[#E33434]'}>{r.realReturn.toFixed(1)}%</strong> after {s.inflation}% inflation erodes your purchasing power. Over {s.years} years, {formatINR(s.amount)} grows to <strong>{formatINR(r.nominalFV)}</strong> on paper — but that's worth only <strong>{formatINR(r.realFV)}</strong> in today's money.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Investment</p>
        <SliderInput label="Amount invested" value={s.amount} min={50000} max={50000000} step={50000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Headline (nominal) return" value={s.nominal} min={3} max={18} step={0.5} onChange={v => set({ nominal: v })} unit="%" />
          <SliderInput label="Tax on returns" hint="Equity LTCG 12.5%, FD = your slab" value={s.taxRate} min={0} max={35} step={0.5} onChange={v => set({ taxRate: v })} unit="%" />
          <SliderInput label="Inflation" value={s.inflation} min={2} max={12} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
          <SliderInput label="Holding period" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Paper value vs real buying power</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'nominal' ? 'On paper' : "In today's money"]} labelFormatter={l => `Year ${l}`} />
            <Legend formatter={v => v === 'nominal' ? 'Paper value' : "Real buying power"} iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="nominal" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            <Area type="monotone" dataKey="real" stroke="#3EA23C" strokeWidth={2.5} fill="url(#rrGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Why this matters</p>
        <p className="text-sm text-slate-700">
          An FD at 7% with 30% tax and 6% inflation gives a real return near <strong>zero</strong> — your money barely holds its value. This is why long-term wealth needs assets that beat inflation after tax, not just "safe" returns.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'inflation', label: 'Inflation Calculator', desc: 'What things will cost' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Post-tax returns side by side' },
        { id: 'capgains', label: 'Capital Gains Tax', desc: 'The exact tax on your gains' },
      ]} />
    </div>
  );
}
