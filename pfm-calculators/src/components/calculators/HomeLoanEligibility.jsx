import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcEMI, formatINR } from '../../utils/financialCalc';

// Reverse-EMI: the loan a given EMI can service.
function loanFromEMI(emi, ratePct, years) {
  const n = years * 12;
  const r = ratePct / 100 / 12;
  if (r === 0) return emi * n;
  return emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

export default function HomeLoanEligibility({ onNavigate }) {
  const [s, set] = useCalcState('loaneligibility', {
    income: 120000, existingEMI: 0, foir: 50, rate: 8.5, tenure: 20, downPct: 20,
  });

  const r = useMemo(() => {
    const maxEMI = Math.max(0, s.income * s.foir / 100 - s.existingEMI);
    const loan = loanFromEMI(maxEMI, s.rate, s.tenure);
    const down = loan * s.downPct / (100 - s.downPct); // down payment implied by LTV
    const property = loan + down;
    const actualEMI = calcEMI(loan, s.rate, s.tenure).emi;
    return { maxEMI, loan, down, property, actualEMI };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Home loan you likely qualify for"
        value={r.loan}
        gradient="indigo"
        sub={`Based on ${s.foir}% of your income going to EMIs, you can service about ${formatINR(r.maxEMI)}/month`}
        meta={[
          { label: 'Eligible loan', value: formatINR(r.loan, true) },
          { label: 'Max EMI', value: formatINR(r.maxEMI) },
          { label: 'Property you can target', value: formatINR(r.property, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Lenders cap your total EMIs at a share of income — the <strong>FOIR</strong> (Fixed Obligation to Income Ratio), usually <strong>40–55%</strong>. At {s.foir}% of {formatINR(s.income)}{s.existingEMI > 0 ? <>, minus your existing {formatINR(s.existingEMI)} EMIs,</> : ''} you can afford about <strong>{formatINR(r.maxEMI)}/month</strong> — which supports a loan of roughly <strong className="text-[#1E1963]">{formatINR(r.loan)}</strong> over {s.tenure} years at {s.rate}%. With a {s.downPct}% down payment, that's a property up to <strong>{formatINR(r.property)}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Profile</p>
        <SliderInput label="Net monthly income" value={s.income} min={20000} max={2000000} step={5000} onChange={v => set({ income: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Existing monthly EMIs" value={s.existingEMI} min={0} max={500000} step={1000} onChange={v => set({ existingEMI: v })} prefix="₹" />
          <SliderInput label="FOIR (EMI share of income)" hint="Banks allow ~40–55%" value={s.foir} min={30} max={60} onChange={v => set({ foir: v })} unit="%" />
          <SliderInput label="Interest rate" value={s.rate} min={7} max={12} step={0.1} onChange={v => set({ rate: v })} unit="%" />
          <SliderInput label="Loan tenure" value={s.tenure} min={5} max={30} onChange={v => set({ tenure: v })} unit=" yr" />
          <SliderInput label="Down payment" value={s.downPct} min={10} max={50} onChange={v => set({ downPct: v })} unit="%" />
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Improve your eligibility</p>
        <p className="text-sm text-slate-700">
          Clear small loans and credit-card dues first — they eat into your FOIR. A longer tenure raises eligibility but costs far more interest. Adding a co-applicant's income (spouse/parent) can substantially increase the loan you qualify for. A credit score above 750 gets you the best rates.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emi', label: 'EMI Calculator', desc: 'Full schedule for this loan' },
        { id: 'rentbuy', label: 'Rent vs Buy', desc: 'Should you buy at all?' },
        { id: 'prepayimpact', label: 'Prepayment Impact', desc: 'Save interest later' },
      ]} />
    </div>
  );
}
