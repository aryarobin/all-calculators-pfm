import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function HRACalculator({ onNavigate }) {
  const [s, set] = useCalcState('hra', {
    basic: 50000, hra: 25000, rent: 22000, metro: true,
  });

  const r = useMemo(() => {
    // Exemption = least of: actual HRA, rent − 10% basic, 50%/40% of basic (metro/non-metro)
    const a = s.hra;
    const b = Math.max(0, s.rent - 0.10 * s.basic);
    const c = (s.metro ? 0.50 : 0.40) * s.basic;
    const exemptM = Math.max(0, Math.min(a, b, c));
    const taxableM = Math.max(0, s.hra - exemptM);
    return {
      exemptM, taxableM,
      exemptY: exemptM * 12, taxableY: taxableM * 12,
      legs: [
        { label: 'Actual HRA received', value: a, win: exemptM === a },
        { label: `Rent − 10% of basic`, value: b, win: exemptM === b },
        { label: `${s.metro ? '50' : '40'}% of basic`, value: c, win: exemptM === c },
      ],
    };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="HRA exemption you can claim"
        value={r.exemptY}
        gradient="indigo"
        sub={`${formatINR(r.exemptM)}/month is tax-free; the rest of your HRA is taxable (old regime only)`}
        meta={[
          { label: 'Exempt / year', value: formatINR(r.exemptY, true) },
          { label: 'Exempt / month', value: formatINR(r.exemptM) },
          { label: 'Taxable HRA / yr', value: formatINR(r.taxableY, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Your HRA exemption is the <strong>least of three numbers</strong>: the actual HRA you get, your rent minus 10% of basic, and {s.metro ? '50%' : '40%'} of basic ({s.metro ? 'metro' : 'non-metro'}). For you that's <strong className="text-[#1E1963]">{formatINR(r.exemptM)}/month</strong> tax-free, leaving {formatINR(r.taxableM)}/month taxable. HRA exemption only applies in the <strong>old tax regime</strong> — the new regime doesn't allow it.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">The least of these three (monthly)</p>
        <div className="space-y-2">
          {r.legs.map((leg, i) => (
            <div key={i} className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${leg.win ? 'border-[#1E1963]/30 bg-[#1E1963]/5' : 'border-slate-200'}`}>
              <span className="text-[13px] text-slate-600">{leg.label}</span>
              <span className={`text-[13px] font-bold ${leg.win ? 'text-[#1E1963]' : 'text-slate-500'}`}>
                {formatINR(leg.value)}{leg.win && <span className="ml-2 text-[10px] font-semibold text-[#1E1963] uppercase">← exempt</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Numbers (monthly)</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[['true', 'Metro'], ['false', 'Non-metro']].map(([id, label]) => (
            <button key={id} onClick={() => set({ metro: id === 'true' })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${String(s.metro) === id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Basic salary (+ DA)" value={s.basic} min={10000} max={500000} step={1000} onChange={v => set({ basic: v })} prefix="₹" />
          <SliderInput label="HRA received" value={s.hra} min={0} max={300000} step={1000} onChange={v => set({ hra: v })} prefix="₹" />
          <SliderInput label="Rent paid" value={s.rent} min={0} max={300000} step={1000} onChange={v => set({ rent: v })} prefix="₹" />
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Claim it right</p>
        <p className="text-sm text-slate-700">
          Metros (Delhi, Mumbai, Kolkata, Chennai) qualify for the 50% rate; everywhere else is 40%. Keep rent receipts, and if annual rent exceeds ₹1 lakh you need the landlord's PAN. You can even pay rent to parents (who own the home) and claim HRA — but they must declare it as income.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'tax', label: 'Income Tax', desc: 'Old vs new with HRA' },
        { id: 'salary', label: 'CTC & Salary', desc: 'Your full in-hand' },
        { id: 'rentbuy', label: 'Rent vs Buy', desc: 'Keep renting or buy?' },
      ]} />
    </div>
  );
}
