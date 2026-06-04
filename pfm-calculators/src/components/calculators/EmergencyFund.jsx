import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import GaugeRing from '../shared/GaugeRing';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function EmergencyFund({ onNavigate }) {
  const [s, set] = useCalcState('emergency', {
    monthlyExpense: 50000, months: 6, current: 100000, monthlySaving: 15000,
  });

  const r = useMemo(() => {
    const target = s.monthlyExpense * s.months;
    const shortfall = Math.max(0, target - s.current);
    const monthsToBuild = s.monthlySaving > 0 ? Math.ceil(shortfall / s.monthlySaving) : Infinity;
    const coverage = target > 0 ? Math.min(100, s.current / target * 100) : 0;
    const monthsCovered = s.monthlyExpense > 0 ? (s.current / s.monthlyExpense) : 0;
    return { target, shortfall, monthsToBuild, coverage, monthsCovered };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${s.months} months of expenses · ${formatINR(s.monthlyExpense)}/mo`}
        value={r.target}
        gradient="blue"
        sub={r.shortfall > 0
          ? `You're ${formatINR(r.shortfall)} short — about ${r.monthsToBuild} months away at ${formatINR(s.monthlySaving)}/mo`
          : `You're fully covered — well done. Park it somewhere liquid.`}
        meta={[
          { label: 'You have', value: formatINR(s.current) },
          { label: 'Still need', value: formatINR(r.shortfall) },
          { label: 'Covers you for', value: `${r.monthsCovered.toFixed(1)} mo` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-5">
        <GaugeRing pct={r.coverage} sublabel="funded" size={104} />
        <p className="text-sm text-slate-600 flex-1">
          {r.coverage >= 100
            ? <>Your emergency fund is <strong className="text-[#3EA23C]">complete</strong>. Keep it in a liquid fund or sweep-in FD — accessible within a day, not invested in equity.</>
            : <>You've funded <strong>{r.coverage.toFixed(0)}%</strong> of a {s.months}-month cushion. Saving <strong>{formatINR(s.monthlySaving)}/mo</strong>, you'll get there in about <strong className="text-[#1E1963]">{r.monthsToBuild} months</strong>.</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Situation</p>
        <SliderInput label="Monthly expenses" hint="Rent, EMIs, food, bills — what you must spend" value={s.monthlyExpense} min={10000} max={1000000} step={5000} onChange={v => set({ monthlyExpense: v })} prefix="₹" />
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700 mb-2">Months of cushion</p>
          <div className="grid grid-cols-4 gap-2">
            {[{ m: 3, l: 'Stable job' }, { m: 6, l: 'Recommended' }, { m: 9, l: 'Variable income' }, { m: 12, l: 'Single earner' }].map(opt => (
              <button key={opt.m} onClick={() => set({ months: opt.m })}
                className={`px-2 py-2.5 rounded-xl border-2 text-center transition-all ${s.months === opt.m ? 'border-[#1E1963] bg-[#1E1963]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className={`text-lg font-black ${s.months === opt.m ? 'text-[#1E1963]' : 'text-slate-700'}`}>{opt.m}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{opt.l}</p>
              </button>
            ))}
          </div>
        </div>
        <SliderInput label="Already saved (liquid)" value={s.current} min={0} max={20000000} step={25000} onChange={v => set({ current: v })} prefix="₹" />
        <SliderInput label="Monthly saving toward this" value={s.monthlySaving} min={0} max={500000} step={1000} onChange={v => set({ monthlySaving: v })} prefix="₹" />
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Where to keep it</p>
        <p className="text-sm text-slate-700">
          An emergency fund is for access, not growth. Keep it in a <strong>liquid mutual fund</strong>, <strong>sweep-in FD</strong>, or high-interest savings account — never in equity, where it could be down 20% exactly when you need it.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'budget', label: 'Budget Planner', desc: 'Free up more to save monthly' },
        { id: 'fdppf', label: 'FD / PPF / NPS', desc: 'Where to park the fund safely' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Once funded, start investing' },
      ]} />
    </div>
  );
}
