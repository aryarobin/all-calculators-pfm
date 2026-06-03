import { useState, useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import { calcInflation, calcSIP, calcSIPFromCorpus, formatINR } from '../../utils/financialCalc';

function calcTimelineEvents({ age, income, monthlyExpenses, monthlyInvest, investReturn, inflation, retireAge, homeGoal, homeYearsFromNow, eduGoal, eduYearsFromNow, emiAmount, emiYears }) {
  const events = [];
  const lifeExpectancy = 80;

  // Current state
  events.push({ age, label: 'Today', sub: `Income: ${formatINR(income)}/mo, Investing: ${formatINR(monthlyInvest)}/mo`, type: 'now', year: 0 });

  // Home goal
  if (homeGoal > 0 && homeYearsFromNow > 0) {
    events.push({
      age: age + homeYearsFromNow,
      label: 'Home Purchase',
      sub: `Corpus needed: ${formatINR(calcInflation(homeGoal, 6, homeYearsFromNow))}`,
      type: 'goal',
      year: homeYearsFromNow,
    });
  }

  // Education goal
  if (eduGoal > 0 && eduYearsFromNow > 0) {
    events.push({
      age: age + eduYearsFromNow,
      label: "Child's Education",
      sub: `Corpus needed: ${formatINR(calcInflation(eduGoal, 10, eduYearsFromNow))}`,
      type: 'goal',
      year: eduYearsFromNow,
    });
  }

  // EMI end
  if (emiAmount > 0 && emiYears > 0) {
    events.push({
      age: age + emiYears,
      label: 'Loan Paid Off',
      sub: `${formatINR(emiAmount)}/mo EMI stops — ${formatINR(emiAmount * 12)}/yr freed up`,
      type: 'positive',
      year: emiYears,
    });
  }

  // Wealth milestones
  const sipData = [];
  let corpus = 0;
  const r = investReturn / 100 / 12;
  const milestones = [1000000, 5000000, 10000000, 25000000, 50000000, 100000000];
  let mIdx = 0;

  for (let y = 1; y <= lifeExpectancy - age; y++) {
    for (let m = 1; m <= 12; m++) corpus = (corpus + monthlyInvest) * (1 + r);
    if (mIdx < milestones.length && corpus >= milestones[mIdx]) {
      events.push({
        age: age + y,
        label: `Corpus: ${formatINR(milestones[mIdx])}`,
        sub: `Wealth milestone reached`,
        type: 'wealth',
        year: y,
      });
      mIdx++;
    }
  }

  // Retirement
  if (retireAge > age) {
    const yearsToRetire = retireAge - age;
    const retireCorpus = calcSIP(monthlyInvest, investReturn, yearsToRetire).corpus;
    events.push({
      age: retireAge,
      label: 'Retirement',
      sub: `Projected corpus: ${formatINR(retireCorpus)}`,
      type: 'retire',
      year: yearsToRetire,
    });
  }

  return events.sort((a, b) => a.year - b.year);
}

const TYPE_STYLES = {
  now: { dot: 'bg-blue-600', line: 'text-blue-700 bg-blue-50 border-blue-100', label: 'Today' },
  goal: { dot: 'bg-orange-500', line: 'text-orange-700 bg-orange-50 border-orange-100', label: 'Goal' },
  positive: { dot: 'bg-emerald-500', line: 'text-emerald-700 bg-emerald-50 border-emerald-100', label: 'Milestone' },
  wealth: { dot: 'bg-violet-500', line: 'text-violet-700 bg-violet-50 border-violet-100', label: 'Wealth' },
  retire: { dot: 'bg-slate-700', line: 'text-slate-700 bg-slate-100 border-slate-200', label: 'Retire' },
};

export default function FinancialTimeline({ onNavigate }) {
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(80000);
  const [monthlyInvest, setMonthlyInvest] = useState(15000);
  const [investReturn, setInvestReturn] = useState(12);
  const [retireAge, setRetireAge] = useState(55);
  const [homeGoal, setHomeGoal] = useState(5000000);
  const [homeYearsFromNow, setHomeYearsFromNow] = useState(7);
  const [eduGoal, setEduGoal] = useState(3000000);
  const [eduYearsFromNow, setEduYearsFromNow] = useState(18);
  const [emiAmount, setEmiAmount] = useState(0);
  const [emiYears, setEmiYears] = useState(20);
  const [showGoals, setShowGoals] = useState(false);

  const events = useMemo(() => calcTimelineEvents({
    age, income, monthlyExpenses: 0, monthlyInvest, investReturn, inflation: 6,
    retireAge, homeGoal, homeYearsFromNow, eduGoal, eduYearsFromNow, emiAmount, emiYears,
  }), [age, income, monthlyInvest, investReturn, retireAge, homeGoal, homeYearsFromNow, eduGoal, eduYearsFromNow, emiAmount, emiYears]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Financial Life Story</p>
        <p className="text-xl font-bold text-slate-800">From age {age} to retirement at {retireAge} — all milestones on one timeline</p>
        <p className="text-sm text-slate-400 mt-1">Every event updates live as you adjust the inputs below.</p>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Your Profile</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current Age" value={age} min={20} max={60} onChange={setAge} unit=" yr" />
          <SliderInput label="Monthly Income" value={income} min={20000} max={500000} step={5000} onChange={setIncome} prefix="₹" />
          <SliderInput label="Monthly Investment (SIP)" value={monthlyInvest} min={1000} max={100000} step={1000} onChange={setMonthlyInvest} prefix="₹" />
          <SliderInput label="Expected Return" value={investReturn} min={6} max={18} step={0.5} onChange={setInvestReturn} unit="%" />
          <SliderInput label="Target Retirement Age" value={Math.max(age + 1, retireAge)} min={age + 1} max={75} onChange={setRetireAge} unit=" yr" />
          {emiAmount > 0 && <SliderInput label="Current EMI" value={emiAmount} min={0} max={100000} step={1000} onChange={setEmiAmount} prefix="₹" />}
        </div>

        <button onClick={() => setShowGoals(!showGoals)} className="text-xs text-blue-600 font-medium hover:text-blue-800 mt-2">
          {showGoals ? 'Hide goals' : 'Add goals & EMI'} {showGoals ? '↑' : '↓'}
        </button>

        {showGoals && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Home Purchase Goal (today's cost)" value={homeGoal} min={0} max={20000000} step={500000} onChange={setHomeGoal} prefix="₹" />
            <SliderInput label="Home — Years from Now" value={homeYearsFromNow} min={1} max={20} onChange={setHomeYearsFromNow} unit=" yr" />
            <SliderInput label="Child Education Goal (today's cost)" value={eduGoal} min={0} max={10000000} step={100000} onChange={setEduGoal} prefix="₹" />
            <SliderInput label="Education — Years from Now" value={eduYearsFromNow} min={5} max={25} onChange={setEduYearsFromNow} unit=" yr" />
            <SliderInput label="Current Monthly EMI" value={emiAmount} min={0} max={100000} step={1000} onChange={setEmiAmount} prefix="₹" />
            {emiAmount > 0 && <SliderInput label="Remaining EMI Tenure" value={emiYears} min={1} max={30} onChange={setEmiYears} unit=" yr" />}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-5">Your Financial Timeline</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>

          <div className="space-y-4">
            {events.map((event, i) => {
              const style = TYPE_STYLES[event.type] || TYPE_STYLES.now;
              return (
                <div key={i} className="flex gap-4 items-start pl-2">
                  {/* Dot */}
                  <div className={`relative z-10 w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 border-white shadow ${style.dot}`}></div>
                  {/* Content */}
                  <div className={`flex-1 px-4 py-3 rounded-xl border ${style.line}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-sm">{event.label}</p>
                        <p className="text-xs opacity-75 mt-0.5">{event.sub}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black">Age {event.age}</p>
                        {event.year > 0 && <p className="text-xs opacity-60">{event.year} yr{event.year !== 1 ? 's' : ''} from now</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {onNavigate && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Deep dive into any milestone</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[{ id: 'sip', label: 'SIP Calculator' }, { id: 'goal', label: 'Goal Planner' }, { id: 'retirement', label: 'Retirement' }, { id: 'emi', label: 'EMI Calculator' }].map(n => (
              <button key={n.id} onClick={() => onNavigate(n.id)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-all text-left">{n.label} →</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
