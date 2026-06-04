import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { TAX_SLABS_NEW, TAX_SLABS_OLD, calcTax, formatINR } from '../../utils/financialCalc';

// Tax on professional income (no salary standard deduction), with cess + 87A rebate.
function taxOn(income, regime) {
  const slabs = regime === 'old' ? TAX_SLABS_OLD : TAX_SLABS_NEW;
  let tax = calcTax(income, slabs);
  if (regime === 'new' && income <= 700000) tax = 0;   // 87A rebate
  if (regime === 'old' && income <= 500000) tax = 0;
  return tax + tax * 0.04; // + 4% cess
}

export default function FreelancerTax({ onNavigate }) {
  const [s, set] = useCalcState('freelancetax', {
    receipts: 3000000, regime: 'new', presumptivePct: 50,
  });

  const r = useMemo(() => {
    const presumptiveIncome = s.receipts * s.presumptivePct / 100; // 44ADA: declare 50%
    const tax = taxOn(presumptiveIncome, s.regime);
    const takeHome = s.receipts - tax;
    const effRate = s.receipts > 0 ? tax / s.receipts * 100 : 0;
    // For contrast: tax if the full receipts were taxed (no presumptive benefit)
    const taxFull = taxOn(s.receipts, s.regime);
    const presumptiveSaving = taxFull - tax;
    return { presumptiveIncome, tax, takeHome, effRate, taxFull, presumptiveSaving };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Your tax as a freelancer under 44ADA"
        value={r.tax}
        gradient="amber"
        sub={`You declare just ${s.presumptivePct}% of receipts as income — no books, no audit — and keep ${formatINR(r.takeHome, true)}`}
        meta={[
          { label: 'Taxable (presumptive)', value: formatINR(r.presumptiveIncome, true) },
          { label: 'Tax payable', value: formatINR(r.tax, true) },
          { label: 'Effective rate', value: `${r.effRate.toFixed(1)}%` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Under <strong>Section 44ADA</strong>, freelancers and professionals (consultants, designers, developers, doctors, lawyers) with receipts up to <strong>₹75 lakh</strong> can simply declare <strong>50%</strong> of receipts as income — the rest is treated as expenses, with no need to maintain books or get audited. On <strong>{formatINR(s.receipts)}</strong> of receipts, that's <strong>{formatINR(r.presumptiveIncome)}</strong> taxable, a tax of <strong className="text-[#CA8D1B]">{formatINR(r.tax)}</strong>, and you take home <strong>{formatINR(r.takeHome)}</strong>. Versus being taxed on the full amount, the presumptive scheme saves you about <strong>{formatINR(r.presumptiveSaving)}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Income</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[['new', 'New regime'], ['old', 'Old regime']].map(([id, label]) => (
            <button key={id} onClick={() => set({ regime: id })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${s.regime === id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
        <SliderInput label="Annual gross receipts" hint="44ADA limit ₹75L" value={s.receipts} min={300000} max={7500000} step={50000} onChange={v => set({ receipts: v })} prefix="₹" />
        <SliderInput label="Income you declare" hint="44ADA minimum is 50%" value={s.presumptivePct} min={50} max={100} step={5} onChange={v => set({ presumptivePct: v })} unit="%" />
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Worth knowing</p>
        <p className="text-sm text-slate-700">
          You must pay <strong>advance tax</strong> by 15 March each year to avoid interest. If your actual expenses are far below 50% of receipts, presumptive taxation is a great deal. GST registration is separate and kicks in above ₹20 lakh of receipts. If your real margins are very high, the new regime is usually simpler and lower.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'tax', label: 'Income Tax', desc: 'Full new vs old comparison' },
        { id: 'budget', label: 'Budget Planner', desc: 'Manage irregular income' },
        { id: 'emergency', label: 'Emergency Fund', desc: 'Vital for freelancers' },
      ]} />
    </div>
  );
}
