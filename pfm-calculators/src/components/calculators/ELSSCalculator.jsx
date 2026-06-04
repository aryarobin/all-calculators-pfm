import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

const C80_LIMIT = 150000;

export default function ELSSCalculator({ onNavigate }) {
  const [s, set] = useCalcState('elss', {
    monthly: 12500, years: 7, returnPct: 12, slab: 30,
  });

  const r = useMemo(() => {
    const annualInvest = s.monthly * 12;
    const eligible = Math.min(annualInvest, C80_LIMIT);
    const taxSavedYr = eligible * s.slab / 100;       // 80C saving each year (old regime)
    const yearsSaving = s.years;                       // assume invested every year
    const totalTaxSaved = taxSavedYr * yearsSaving;

    const invested = annualInvest * s.years;
    const corpus = calcSIP(s.monthly, s.returnPct, s.years).corpus;
    const gains = corpus - invested;

    // Effective benefit = corpus + cumulative tax saved (the 80C is real cash back)
    const effectiveValue = corpus + totalTaxSaved;

    const data = [];
    for (let y = 1; y <= s.years; y++) {
      data.push({ year: y, corpus: Math.round(calcSIP(s.monthly, s.returnPct, y).corpus), invested: Math.round(annualInvest * y) });
    }
    return { annualInvest, eligible, taxSavedYr, totalTaxSaved, invested, corpus, gains, effectiveValue, data, capped: annualInvest > C80_LIMIT };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`ELSS — corpus plus tax saved over ${s.years} years`}
        value={r.effectiveValue}
        gradient="emerald"
        sub={`Equity growth and ${formatINR(r.totalTaxSaved, true)} of 80C tax savings — the only 80C option with just a 3-year lock-in`}
        meta={[
          { label: 'Corpus', value: formatINR(r.corpus, true) },
          { label: 'Tax saved (80C)', value: formatINR(r.totalTaxSaved, true) },
          { label: 'You invested', value: formatINR(r.invested, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          ELSS (tax-saver mutual funds) give you <strong>equity returns</strong> and an <strong>80C deduction</strong> in one. Investing <strong>{formatINR(s.monthly)}/mo</strong>, you claim up to <strong>{formatINR(r.eligible)}/yr</strong> under 80C — saving <strong className="text-[#3EA23C]">{formatINR(r.taxSavedYr)}</strong> in tax each year at your {s.slab}% slab. Over {s.years} years that's <strong>{formatINR(r.totalTaxSaved)}</strong> back in your pocket, on top of a <strong>{formatINR(r.corpus)}</strong> corpus. The lock-in is just <strong>3 years</strong> — the shortest of any 80C option (PPF is 15, NSC is 5).
          {r.capped && <> Note: only ₹1.5L/yr qualifies for 80C — you're investing above that, so the extra is great for growth but earns no further tax break.</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your ELSS SIP</p>
        <SliderInput label="Monthly investment" hint="₹12,500/mo = ₹1.5L/yr (full 80C)" value={s.monthly} min={500} max={50000} step={500} onChange={v => set({ monthly: v })} prefix="₹" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Duration" hint="Min 3-yr lock-in per instalment" value={s.years} min={3} max={30} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Expected return" value={s.returnPct} min={8} max={16} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
          <SliderInput label="Your tax slab (old regime)" value={s.slab} min={5} max={30} step={5} onChange={v => set({ slab: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">ELSS corpus growth</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="elssGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'corpus' ? 'Corpus' : 'Invested']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="corpus" stroke="#3EA23C" strokeWidth={2.5} fill="url(#elssGrad)" dot={false} />
            <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Worth knowing</p>
        <p className="text-sm text-slate-700">
          ELSS only helps in the <strong>old tax regime</strong> — the new regime has no 80C. Each SIP instalment is locked for 3 years from its own date. Gains are taxed like any equity fund: 12.5% LTCG above ₹1.25L/yr. If you're already maxing 80C via EPF/PPF, a plain index fund may serve better.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'tax', label: 'Income Tax', desc: 'See your 80C benefit in the slab' },
        { id: 'indexactive', label: 'Index vs Active', desc: 'Picking the ELSS fund type' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Compare with a regular SIP' },
      ]} />
    </div>
  );
}
