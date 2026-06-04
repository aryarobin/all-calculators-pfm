import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// FY 2024-25 rules (post-23 Jul 2024 Budget)
const ASSETS = {
  equity: {
    label: 'Equity / Equity MF', longMonths: 12,
    stcgRate: 20, ltcgRate: 12.5, ltcgExemption: 125000,
    note: 'STT-paid shares & equity funds. LTCG over 1 year, ₹1.25L/yr exempt.',
  },
  debt: {
    label: 'Debt Mutual Fund', longMonths: 0,
    stcgRate: 'slab', ltcgRate: 'slab', ltcgExemption: 0,
    note: 'Debt funds bought after Apr 2023 are always taxed at your slab — no LTCG benefit.',
  },
  property: {
    label: 'Property / Real Estate', longMonths: 24,
    stcgRate: 'slab', ltcgRate: 12.5, ltcgExemption: 0,
    note: 'LTCG after 2 years at 12.5% (no indexation under the new regime). STCG at slab.',
  },
  gold: {
    label: 'Gold / Gold Funds', longMonths: 24,
    stcgRate: 'slab', ltcgRate: 12.5, ltcgExemption: 0,
    note: 'Physical gold & gold funds: LTCG after 2 years at 12.5%. STCG at slab.',
  },
};

export default function CapitalGainsTax({ onNavigate }) {
  const [s, set] = useCalcState('capgains', {
    asset: 'equity', buy: 200000, sell: 350000, months: 18, slab: 30,
  });

  const a = ASSETS[s.asset];
  const r = useMemo(() => {
    const gain = Math.max(0, s.sell - s.buy);
    const isLong = a.longMonths > 0 && s.months >= a.longMonths;
    let rate, taxable, tax, kind;
    if (isLong) {
      kind = 'Long-Term (LTCG)';
      taxable = Math.max(0, gain - a.ltcgExemption);
      rate = a.ltcgRate === 'slab' ? s.slab : a.ltcgRate;
      tax = taxable * rate / 100;
    } else {
      kind = 'Short-Term (STCG)';
      taxable = gain;
      rate = a.stcgRate === 'slab' ? s.slab : a.stcgRate;
      tax = taxable * rate / 100;
    }
    const cess = tax * 0.04;
    return { gain, isLong, kind, rate, taxable, tax: tax + cess, net: s.sell - (tax + cess), exemptionUsed: isLong ? Math.min(gain, a.ltcgExemption) : 0 };
  }, [s, a]);

  const effRate = r.gain > 0 ? (r.tax / r.gain * 100) : 0;

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${a.label} · ${r.kind}`}
        value={r.tax}
        gradient={r.isLong ? 'emerald' : 'rose'}
        sub={`Tax on a ${formatINR(r.gain)} gain at ${r.rate}%${r.isLong && a.ltcgExemption ? ` (after ₹${(a.ltcgExemption/100000).toFixed(2)}L exemption)` : ''} + 4% cess`}
        meta={[
          { label: 'Total gain', value: formatINR(r.gain) },
          { label: 'Taxable gain', value: formatINR(r.taxable) },
          { label: 'You keep', value: formatINR(r.net, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Held for <strong>{s.months} months</strong> → this is a <strong className={r.isLong ? 'text-[#3EA23C]' : 'text-[#E33434]'}>{r.kind}</strong>{a.longMonths > 0 ? ` (the cut-off is ${a.longMonths} months)` : ''}. {a.note}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Asset Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {Object.entries(ASSETS).map(([key, v]) => (
            <button key={key} onClick={() => set({ asset: key })}
              className={`px-3 py-2.5 rounded-xl border-2 text-left text-[13px] font-semibold transition-all ${s.asset === key ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {v.label}
            </button>
          ))}
        </div>
        <SliderInput label="Buy value (cost)" value={s.buy} min={10000} max={100000000} step={10000} onChange={v => set({ buy: v })} prefix="₹" hint="Tap to type" />
        <SliderInput label="Sell value" value={s.sell} min={10000} max={200000000} step={10000} onChange={v => set({ sell: v })} prefix="₹" />
        <SliderInput label="Holding period" value={s.months} min={1} max={120} onChange={v => set({ months: v })} unit=" mo" hint={a.longMonths > 0 ? `Long-term after ${a.longMonths} months` : 'Always taxed at slab'} />
        {(a.stcgRate === 'slab' || a.ltcgRate === 'slab') && (
          <SliderInput label="Your income tax slab" value={s.slab} min={0} max={30} step={5} onChange={v => set({ slab: v })} unit="%" hint="Used when this asset is taxed at slab" />
        )}
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Tip</p>
        <p className="text-sm text-slate-700">
          {s.asset === 'equity'
            ? `Equity LTCG up to ₹1.25L per financial year is tax-free — harvest gains yearly to use this exemption. Holding just past 12 months drops your rate from 20% to 12.5%.`
            : `Holding period decides everything. Crossing the long-term threshold can change your rate and, for equity, unlock the ₹1.25L exemption.`}
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'tax', label: 'Income Tax', desc: 'Your full salary tax, new vs old' },
        { id: 'swp', label: 'Income & Withdrawal', desc: 'Tax-efficient SWP from equity' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Post-tax returns side by side' },
      ]} />
    </div>
  );
}
