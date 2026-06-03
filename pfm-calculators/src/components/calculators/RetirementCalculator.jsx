import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcRetirement, formatINR, calcSIPYearly } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5 text-[13px]">Age {label}</p>
      {payload.map(p => <div key={p.name} className="flex justify-between gap-8 mb-0.5"><span className="text-slate-400">{p.name}</span><span className="font-bold tabular-nums" style={{ color: p.color }}>{formatINR(p.value)}</span></div>)}
    </div>
  );
};

export default function RetirementCalculator({ onNavigate }) {
  const [s, set] = useCalcState('retirement', {
    currentAge: 30, retirementAge: 55, lifeExpectancy: 80,
    monthlyExpenses: 50000, inflation: 6, preReturn: 12, postReturn: 8, currentSavings: 500000,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const yearsToRetire = Math.max(1, s.retirementAge - s.currentAge);

  const result = useMemo(() => calcRetirement({
    currentAge: s.currentAge,
    retirementAge: Math.max(s.currentAge + 1, s.retirementAge),
    lifeExpectancy: Math.max(s.retirementAge + 1, s.lifeExpectancy),
    monthlyExpenses: s.monthlyExpenses, inflation: s.inflation,
    preRetirementReturn: s.preReturn, postRetirementReturn: s.postReturn,
    currentSavings: s.currentSavings,
  }), [s]);

  const growthData = useMemo(() => {
    const sipData = calcSIPYearly(result.sipNeeded, s.preReturn, yearsToRetire);
    return sipData.map((d, i) => ({
      age: s.currentAge + i + 1,
      projected: Math.round(d.corpus + s.currentSavings * Math.pow(1 + s.preReturn / 100, i + 1)),
    }));
  }, [result, s.preReturn, yearsToRetire, s.currentAge, s.currentSavings]);

  return (
    <div className="space-y-4">

      {/* Hero */}
      <HeroCard
        label={`Retire at ${s.retirementAge} · ${formatINR(s.monthlyExpenses)}/mo lifestyle today`}
        value={result.corpusNeeded}
        gradient="slate"
        sub={`Corpus needed at retirement, inflation-adjusted`}
        meta={[
          { label: 'Monthly SIP needed', value: `${formatINR(result.sipNeeded)}/mo` },
          { label: `Expenses at ${s.retirementAge}`, value: `${formatINR(result.monthlyExpensesAtRetirement)}/mo` },
          { label: 'Time to retire', value: `${yearsToRetire} yrs` },
        ]}
      />

      {s.currentSavings > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600">
            Your existing <strong className="text-emerald-700">{formatINR(s.currentSavings)}</strong> grows to <strong className="text-emerald-700">{formatINR(result.growthOfCurrentSavings)}</strong> by retirement — covering <strong>{Math.min(100, Math.round(result.growthOfCurrentSavings / result.corpusNeeded * 100))}%</strong> of your corpus.
          </p>
        </div>
      )}

      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Parameters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current Age" value={s.currentAge} min={20} max={55} onChange={v => set({ currentAge: v })} unit=" yr" />
          <SliderInput label="Retirement Age" value={Math.max(s.currentAge + 1, s.retirementAge)} min={s.currentAge + 1} max={70} onChange={v => set({ retirementAge: v })} unit=" yr" />
          <SliderInput label="Current Monthly Expenses" hint="Tap value to type · we'll inflate it" value={s.monthlyExpenses} min={10000} max={2000000} step={5000} onChange={v => set({ monthlyExpenses: v })} prefix="₹" />
          <SliderInput label="Expected Inflation" value={s.inflation} min={3} max={10} step={0.5} onChange={v => set({ inflation: v })} unit="%" hint="India avg: 6%" />
        </div>
        <button onClick={() => setShowAdvanced(a => !a)} className="text-xs text-blue-600 font-semibold hover:text-blue-800 mt-1">
          {showAdvanced ? 'Hide advanced ↑' : 'Show return rates & savings ↓'}
        </button>
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Pre-Retirement Return" value={s.preReturn} min={6} max={18} step={0.5} onChange={v => set({ preReturn: v })} unit="%" />
            <SliderInput label="Post-Retirement Return" value={s.postReturn} min={4} max={12} step={0.5} onChange={v => set({ postReturn: v })} unit="%" />
            <SliderInput label="Current Savings / Investments" value={s.currentSavings} min={0} max={500000000} step={500000} onChange={v => set({ currentSavings: v })} prefix="₹" />
            <SliderInput label="Life Expectancy" value={Math.max(s.retirementAge + 1, s.lifeExpectancy)} min={s.retirementAge + 1} max={100} onChange={v => set({ lifeExpectancy: v })} unit=" yr" />
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-1">Projected corpus growth to retirement</p>
        <p className="text-xs text-slate-400 mb-4">Orange line = target corpus needed</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={growthData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retireGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#334155" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#334155" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Age ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(yearsToRetire / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <ReferenceLine y={result.corpusNeeded} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Target', fill: '#f97316', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="projected" name="Projected Corpus" stroke="#334155" strokeWidth={2.5} fill="url(#retireGrad)" dot={false} activeDot={{ r: 5, fill: '#334155' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'readiness', label: 'Readiness Dashboard', desc: 'Score across all your assets' },
        { id: 'swp', label: 'Withdrawal Plan', desc: 'Make corpus last 25+ years' },
        { id: 'sip', label: 'SIP Calculator', desc: `See how ${formatINR(result.sipNeeded)}/mo grows` },
      ]} />
    </div>
  );
}
