import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

export default function DirectVsRegular({ onNavigate }) {
  const [s, set] = useCalcState('directregular', {
    monthly: 25000, years: 20, grossReturn: 12, regularER: 1.5, directER: 0.6,
  });

  const r = useMemo(() => {
    const directNet = s.grossReturn - s.directER;
    const regularNet = s.grossReturn - s.regularER;
    const direct = calcSIP(s.monthly, directNet, s.years).corpus;
    const regular = calcSIP(s.monthly, regularNet, s.years).corpus;
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      data.push({
        year: y,
        direct: Math.round(calcSIP(s.monthly, directNet, y).corpus),
        regular: Math.round(calcSIP(s.monthly, regularNet, y).corpus),
      });
    }
    return { direct, regular, lost: direct - regular, directNet, regularNet, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="What the regular-plan commission costs you"
        value={r.lost}
        gradient="rose"
        sub={`A ${(s.regularER - s.directER).toFixed(1)}% higher expense ratio, compounded over ${s.years} years`}
        meta={[
          { label: 'Direct plan corpus', value: formatINR(r.direct, true) },
          { label: 'Regular plan corpus', value: formatINR(r.regular, true) },
          { label: 'Lost to commission', value: formatINR(r.lost, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          A <strong>regular plan</strong> quietly pays your distributor a trail commission via a higher expense ratio ({s.regularER}% vs {s.directER}% for <strong>direct</strong>). It looks tiny, but on a {formatINR(s.monthly)}/mo SIP over {s.years} years it silently eats <strong className="text-[#E33434]">{formatINR(r.lost)}</strong> — money that stays yours in a direct plan. Same fund, same manager, zero advice difference if you DIY.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your SIP</p>
        <SliderInput label="Monthly SIP" value={s.monthly} min={1000} max={500000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Duration" value={s.years} min={3} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Gross fund return" value={s.grossReturn} min={6} max={18} step={0.5} onChange={v => set({ grossReturn: v })} unit="%" />
          <SliderInput label="Regular plan expense ratio" hint="Typically 1–2.25%" value={s.regularER} min={0.5} max={2.5} step={0.05} onChange={v => set({ regularER: v })} unit="%" />
          <SliderInput label="Direct plan expense ratio" hint="Typically 0.3–1%" value={s.directER} min={0.1} max={1.5} step={0.05} onChange={v => set({ directER: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Direct vs Regular over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Direct</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Regular</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'direct' ? 'Direct' : 'Regular']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="direct" stroke="#1E1963" strokeWidth={2.5} fill="url(#drGrad)" dot={false} />
            <Area type="monotone" dataKey="regular" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">How to switch</p>
        <p className="text-sm text-slate-700">
          Buy <strong>direct plans</strong> through the AMC website, MF Central, or a zero-commission app. If you value advice, pay a flat fee-only advisor — it'll still cost far less than the trail commission baked into regular plans.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Project your direct-plan SIP' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Post-cost returns across options' },
        { id: 'xirr', label: 'XIRR Calculator', desc: 'Check your real fund returns' },
      ]} />
    </div>
  );
}
