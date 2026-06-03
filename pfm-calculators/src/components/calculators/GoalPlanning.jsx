import { useState, useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import GaugeRing from '../shared/GaugeRing';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcGoal, formatINR } from '../../utils/financialCalc';

const GOALS = [
  { id: 'home', label: 'Dream Home', defaultAmount: 5000000 },
  { id: 'education', label: "Child's Education", defaultAmount: 3000000 },
  { id: 'car', label: 'Dream Car', defaultAmount: 1500000 },
  { id: 'wedding', label: 'Wedding', defaultAmount: 2000000 },
  { id: 'vacation', label: 'World Tour', defaultAmount: 500000 },
  { id: 'startup', label: 'Business / Startup', defaultAmount: 2000000 },
  { id: 'retirement', label: 'Retirement Fund', defaultAmount: 10000000 },
  { id: 'custom', label: 'Custom Goal', defaultAmount: 1000000 },
];

export default function GoalPlanning({ onNavigate }) {
  const [s, set] = useCalcState('goal', {
    selectedGoal: 'home', goalAmount: 5000000, years: 10,
    inflation: 6, expectedReturn: 12, currentSavings: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = useMemo(() => calcGoal({
    goalAmount: s.goalAmount, yearsToGoal: s.years, inflation: s.inflation,
    expectedReturn: s.expectedReturn, currentSavings: s.currentSavings,
  }), [s]);

  const goalLabel = GOALS.find(g => g.id === s.selectedGoal)?.label;

  return (
    <div className="space-y-4">

      {/* Goal picker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">What are you saving for?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => set({ selectedGoal: g.id, goalAmount: g.defaultAmount })}
              className={`px-3 py-2.5 rounded-xl border text-left text-sm font-semibold transition-all ${s.selectedGoal === g.id ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <HeroCard
        label={`${goalLabel} · ${formatINR(s.goalAmount)} today · in ${s.years} yrs`}
        value={result.sipRequired}
        rawValue={`${formatINR(result.sipRequired)}/mo`}
        gradient="emerald"
        sub={`To reach ${formatINR(result.futureGoalAmount)} (inflation-adjusted)`}
        meta={[
          { label: 'Future goal cost', value: formatINR(result.futureGoalAmount) },
          { label: 'Or lumpsum now', value: formatINR(result.lumpsumRequired) },
        ]}
      />

      {result.growthOfCurrentSavings > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-5">
          <GaugeRing
            pct={result.growthOfCurrentSavings / result.futureGoalAmount * 100}
            sublabel="covered"
            size={104}
          />
          <p className="text-sm text-slate-600 flex-1">
            Your existing savings of <strong className="text-emerald-700">{formatINR(s.currentSavings)}</strong> will grow to <strong className="text-emerald-700">{formatINR(result.growthOfCurrentSavings)}</strong> by the goal date — the gauge shows how much of the goal that covers. Your SIP fills the rest.
          </p>
        </div>
      )}

      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
        <SliderInput label={`${goalLabel} — cost in today's money`} hint="Tap value to type any amount" value={s.goalAmount} min={100000} max={500000000} step={100000} onChange={v => set({ goalAmount: v })} prefix="₹" />
        <SliderInput label="Years to Goal" value={s.years} min={1} max={30} onChange={v => set({ years: v })} unit=" yr" />
        <SliderInput label="Expected Investment Return" value={s.expectedReturn} min={5} max={30} step={0.5} onChange={v => set({ expectedReturn: v })} unit="%" />

        <button onClick={() => setShowAdvanced(a => !a)} className="text-xs text-blue-600 font-semibold hover:text-blue-800 mt-1">
          {showAdvanced ? 'Hide advanced ↑' : 'Show inflation & existing savings ↓'}
        </button>
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Inflation Rate" value={s.inflation} min={3} max={12} step={0.5} onChange={v => set({ inflation: v })} unit="%" hint="India avg 6% · Education 10–12% · Medical 8%" />
            <SliderInput label="Already Saved for This Goal" value={s.currentSavings} min={0} max={s.goalAmount} step={10000} onChange={v => set({ currentSavings: v })} prefix="₹" />
          </div>
        )}
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: `See how ${formatINR(result.sipRequired)}/mo grows` },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Plan your largest goal' },
        { id: 'inflation', label: 'Inflation Calculator', desc: 'Understand future costs' },
      ]} />
    </div>
  );
}
