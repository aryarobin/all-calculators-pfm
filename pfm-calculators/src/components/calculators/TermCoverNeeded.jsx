import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Cover ≈ corpus to replace income for N years + liabilities + future goals − existing assets
function corpusForIncome(annualIncome, years, realReturn) {
  const r = realReturn / 100;
  if (r <= 0) return annualIncome * years;
  return annualIncome * (1 - Math.pow(1 + r, -years)) / r;
}

export default function TermCoverNeeded({ onNavigate }) {
  const [s, set] = useCalcState('termcover', {
    annualIncome: 1500000, replaceYears: 20, realReturn: 3,
    loans: 4000000, goals: 5000000, existingCover: 0, savings: 1000000,
  });

  const r = useMemo(() => {
    const incomeCorpus = corpusForIncome(s.annualIncome, s.replaceYears, s.realReturn);
    const gross = incomeCorpus + s.loans + s.goals;
    const cover = Math.max(0, gross - s.existingCover - s.savings);
    const multiple = s.annualIncome > 0 ? cover / s.annualIncome : 0;
    return { incomeCorpus, gross, cover, multiple };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Life cover your family actually needs"
        value={r.cover}
        gradient="blue"
        sub={`Enough to replace your income for ${s.replaceYears} years, clear debts, and fund key goals`}
        meta={[
          { label: 'Income to replace', value: formatINR(r.incomeCorpus, true) },
          { label: 'About', value: `${r.multiple.toFixed(0)}× income` },
          { label: 'Already covered', value: formatINR(s.existingCover + s.savings, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          If you weren't around, your family needs a corpus that throws off <strong>{formatINR(s.annualIncome)}/yr</strong> for <strong>{s.replaceYears} years</strong> ({formatINR(r.incomeCorpus)}), plus <strong>{formatINR(s.loans)}</strong> to clear loans and <strong>{formatINR(s.goals)}</strong> for goals like education — minus what you already have. That's a term cover of <strong className="text-[#1E1963]">{formatINR(r.cover)}</strong>. Buy term, not endowment — it's a fraction of the premium.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Situation</p>
        <SliderInput label="Annual income to replace" value={s.annualIncome} min={300000} max={20000000} step={100000} onChange={v => set({ annualIncome: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Years to replace income" hint="Until family is independent / you'd retire" value={s.replaceYears} min={5} max={40} onChange={v => set({ replaceYears: v })} unit=" yr" />
          <SliderInput label="Real return on payout" hint="Return − inflation (3% is prudent)" value={s.realReturn} min={1} max={7} step={0.5} onChange={v => set({ realReturn: v })} unit="%" />
          <SliderInput label="Outstanding loans" hint="Home, car, personal" value={s.loans} min={0} max={50000000} step={100000} onChange={v => set({ loans: v })} prefix="₹" />
          <SliderInput label="Future goals to fund" hint="Children's education, marriage" value={s.goals} min={0} max={50000000} step={100000} onChange={v => set({ goals: v })} prefix="₹" />
          <SliderInput label="Existing life cover" value={s.existingCover} min={0} max={50000000} step={500000} onChange={v => set({ existingCover: v })} prefix="₹" />
          <SliderInput label="Liquid savings / investments" value={s.savings} min={0} max={50000000} step={100000} onChange={v => set({ savings: v })} prefix="₹" />
        </div>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'insurevsinvest', label: 'Insurance vs Investment', desc: 'Buy term + invest the rest' },
        { id: 'emergency', label: 'Emergency Fund', desc: 'The other half of protection' },
        { id: 'goal', label: 'Goal Planner', desc: 'Fund those goals while alive' },
      ]} />
    </div>
  );
}
