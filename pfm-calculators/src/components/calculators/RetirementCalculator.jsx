import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcRetirement, formatINR, calcSIPYearly } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow p-2.5 text-xs">
      <p className="font-semibold text-slate-600 mb-1">Age {label}</p>
      {payload.map(p => <div key={p.name} className="flex justify-between gap-5"><span className="text-slate-400">{p.name}</span><span className="font-semibold" style={{ color: p.color }}>{formatINR(p.value)}</span></div>)}
    </div>
  );
};

export default function RetirementCalculator({ onNavigate }) {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(55);
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [preReturn, setPreReturn] = useState(12);
  const [postReturn, setPostReturn] = useState(8);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const yearsToRetire = Math.max(1, retirementAge - currentAge);

  const result = useMemo(() => calcRetirement({
    currentAge, retirementAge: Math.max(currentAge + 1, retirementAge),
    lifeExpectancy: Math.max(retirementAge + 1, lifeExpectancy),
    monthlyExpenses, inflation,
    preRetirementReturn: preReturn,
    postRetirementReturn: postReturn,
    currentSavings,
  }), [currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflation, preReturn, postReturn, currentSavings]);

  const growthData = useMemo(() => {
    const sipData = calcSIPYearly(result.sipNeeded, preReturn, yearsToRetire);
    return sipData.map((d, i) => ({
      age: currentAge + i + 1,
      projected: Math.round(d.corpus + currentSavings * Math.pow(1 + preReturn / 100, i + 1)),
    }));
  }, [result, preReturn, yearsToRetire, currentAge, currentSavings]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Retirement Plan</p>
          <p className="text-xl font-bold text-slate-800">
            Retiring at <span className="text-blue-700">{retirementAge}</span> with <span className="text-blue-700">{formatINR(monthlyExpenses)}/mo</span> in today's money
          </p>
        </div>
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-400 mb-1">Corpus needed at retirement (inflation-adjusted)</p>
          <p className="text-5xl font-bold text-blue-700 leading-none">{formatINR(result.corpusNeeded)}</p>
          <div className="flex flex-wrap gap-6 mt-3">
            <div>
              <p className="text-xs text-slate-400">Monthly SIP needed now</p>
              <p className="text-xl font-bold text-slate-800">{formatINR(result.sipNeeded)}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expenses at {retirementAge}</p>
              <p className="text-xl font-bold text-slate-500">{formatINR(result.monthlyExpensesAtRetirement)}/mo</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Time to retire</p>
              <p className="text-xl font-bold text-slate-500">{yearsToRetire} years</p>
            </div>
          </div>
        </div>
        {currentSavings > 0 && (
          <div className="px-6 pb-5">
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <p className="text-xs text-emerald-700 font-medium">
                Your existing <strong>{formatINR(currentSavings)}</strong> in savings grows to <strong>{formatINR(result.growthOfCurrentSavings)}</strong> by retirement — covering <strong>{Math.min(100, Math.round(result.growthOfCurrentSavings / result.corpusNeeded * 100))}%</strong> of the corpus.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Parameters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current Age" value={currentAge} min={20} max={55} onChange={setCurrentAge} unit=" yr" />
          <SliderInput label="Retirement Age" value={Math.max(currentAge + 1, retirementAge)} min={currentAge + 1} max={70} onChange={setRetirementAge} unit=" yr" />
          <SliderInput label="Current Monthly Expenses" hint="In today's money — we'll inflate it" value={monthlyExpenses} min={10000} max={500000} step={5000} onChange={setMonthlyExpenses} prefix="₹" />
          <SliderInput label="Expected Inflation" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} unit="%" hint="India avg: 6%" />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-blue-600 font-medium hover:text-blue-800 mt-1">
          {showAdvanced ? 'Hide advanced' : 'Show return rates & savings'} {showAdvanced ? '↑' : '↓'}
        </button>
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Pre-Retirement Return" value={preReturn} min={6} max={18} step={0.5} onChange={setPreReturn} unit="%" />
            <SliderInput label="Post-Retirement Return" value={postReturn} min={4} max={12} step={0.5} onChange={setPostReturn} unit="%" />
            <SliderInput label="Current Savings / Investments" value={currentSavings} min={0} max={10000000} step={100000} onChange={setCurrentSavings} prefix="₹" />
            <SliderInput label="Life Expectancy" value={Math.max(retirementAge + 1, lifeExpectancy)} min={retirementAge + 1} max={100} onChange={setLifeExpectancy} unit=" yr" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-1">Projected corpus growth to retirement</p>
        <p className="text-xs text-slate-400 mb-4">Orange line = target corpus. Green = when you've reached the goal.</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={growthData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retireGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Age ${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={65} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <ReferenceLine y={result.corpusNeeded} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Target', fill: '#f97316', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="projected" name="Projected Corpus" stroke="#1d4ed8" strokeWidth={2} fill="url(#retireGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {onNavigate && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Related tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[{ id: 'readiness', label: 'Readiness Dashboard', desc: 'See score across all your assets' }, { id: 'swp', label: 'Withdrawal Plan', desc: 'Make corpus last 25+ years' }, { id: 'sip', label: 'SIP Calculator', desc: `See how ${formatINR(result.sipNeeded)}/mo grows` }].map(n => (
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
