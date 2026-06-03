import { useState, useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
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
  const [selectedGoal, setSelectedGoal] = useState('home');
  const [goalAmount, setGoalAmount] = useState(5000000);
  const [years, setYears] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = useMemo(() => calcGoal({ goalAmount, yearsToGoal: years, inflation, expectedReturn, currentSavings }), [goalAmount, years, inflation, expectedReturn, currentSavings]);

  return (
    <div className="space-y-4">
      {/* Goal picker */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What are you saving for?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => { setSelectedGoal(g.id); setGoalAmount(g.defaultAmount); }}
              className={`px-3 py-2.5 rounded-xl border text-left text-sm font-medium transition-all ${selectedGoal === g.id ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Story header */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Goal Summary</p>
          <p className="text-xl font-bold text-slate-800 leading-snug">
            <span className="text-blue-700">{GOALS.find(g => g.id === selectedGoal)?.label}</span> costing <span className="text-blue-700">{formatINR(goalAmount)}</span> today — needed in <span className="text-blue-700">{years} years</span>
          </p>
        </div>
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-400 mb-1">Inflation-adjusted goal amount</p>
          <p className="text-5xl font-black text-blue-700 leading-none">{formatINR(result.futureGoalAmount)}</p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-xs text-slate-400">Monthly SIP needed</p>
              <p className="text-xl font-bold text-slate-800">{formatINR(result.sipRequired)}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Or invest lumpsum now</p>
              <p className="text-xl font-bold text-slate-500">{formatINR(result.lumpsumRequired)}</p>
            </div>
          </div>
        </div>
        {result.growthOfCurrentSavings > 0 && (
          <div className="px-6 pb-5">
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-xs text-emerald-700 font-medium">
                Your existing savings of <strong>{formatINR(currentSavings)}</strong> will grow to <strong>{formatINR(result.growthOfCurrentSavings)}</strong> — covering <strong>{Math.round(result.growthOfCurrentSavings / result.futureGoalAmount * 100)}%</strong> of the goal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Adjust Parameters</p>
        <SliderInput label={`${GOALS.find(g => g.id === selectedGoal)?.label} — cost in today's money`} value={goalAmount} min={100000} max={50000000} step={100000} onChange={setGoalAmount} prefix="₹" hint="We'll inflate this automatically" />
        <SliderInput label="Years to Goal" value={years} min={1} max={30} onChange={setYears} unit=" yr" />
        <SliderInput label="Expected Investment Return" value={expectedReturn} min={5} max={20} step={0.5} onChange={setExpectedReturn} unit="%" />

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-2 text-xs text-blue-600 font-medium hover:text-blue-800">
          {showAdvanced ? 'Hide advanced' : 'Show inflation & existing savings'} {showAdvanced ? '↑' : '↓'}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Inflation Rate" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} unit="%" hint="India avg: 6% | Education: 10–12% | Medical: 8%" />
            <SliderInput label="Already Saved for This Goal" value={currentSavings} min={0} max={goalAmount} step={10000} onChange={setCurrentSavings} prefix="₹" />
          </div>
        )}
      </div>

      {onNavigate && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Continue your journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[{ id: 'sip', label: 'SIP Calculator', desc: `See how ${formatINR(result.sipRequired)}/mo grows` }, { id: 'retirement', label: 'Retirement Planner', desc: 'Plan your largest goal' }, { id: 'inflation', label: 'Inflation Calculator', desc: 'Understand future costs better' }].map(n => (
              <button key={n.id} onClick={() => onNavigate(n.id)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{n.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
