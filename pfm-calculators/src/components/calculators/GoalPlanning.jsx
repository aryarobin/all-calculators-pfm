import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcGoal, formatINR } from '../../utils/financialCalc';

const GOALS = [
  { id: 'home', label: '🏠 Dream Home', icon: '🏠', defaultAmount: 5000000, color: '#f97316', hint: 'Down payment or full cost' },
  { id: 'education', label: '🎓 Child\'s Education', icon: '🎓', defaultAmount: 3000000, color: '#7c3aed', hint: 'College fees in today\'s money' },
  { id: 'car', label: '🚗 Dream Car', icon: '🚗', defaultAmount: 1500000, color: '#3b82f6', hint: 'On-road price today' },
  { id: 'wedding', label: '💍 Dream Wedding', icon: '💍', defaultAmount: 2000000, color: '#ec4899', hint: 'Total wedding budget' },
  { id: 'vacation', label: '✈️ World Tour', icon: '✈️', defaultAmount: 500000, color: '#10b981', hint: 'Trip budget in today\'s money' },
  { id: 'startup', label: '🚀 Startup / Business', icon: '🚀', defaultAmount: 2000000, color: '#f59e0b', hint: 'Seed capital needed' },
  { id: 'custom', label: '🎯 Custom Goal', icon: '🎯', defaultAmount: 1000000, color: '#6366f1', hint: 'Your own financial goal' },
];

export default function GoalPlanning() {
  const [selectedGoal, setSelectedGoal] = useState('home');
  const [goalAmount, setGoalAmount] = useState(5000000);
  const [years, setYears] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [currentSavings, setCurrentSavings] = useState(0);

  const goal = GOALS.find(g => g.id === selectedGoal);

  const result = useMemo(() => calcGoal({
    goalAmount, yearsToGoal: years, inflation, expectedReturn, currentSavings
  }), [goalAmount, years, inflation, expectedReturn, currentSavings]);

  const pieData = [
    { name: 'Existing Savings Growth', value: Math.round(result.growthOfCurrentSavings), color: '#10b981' },
    { name: 'SIP Corpus Needed', value: Math.round(result.additionalNeeded), color: '#f97316' },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Goal Planning Calculator</h2>
        <p className="text-slate-500 mt-1">Pick a dream and find out exactly how to achieve it!</p>
      </div>

      {/* Goal selector */}
      <div className="card mb-6">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">🎯 What are you saving for?</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => { setSelectedGoal(g.id); setGoalAmount(g.defaultAmount); }}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                selectedGoal === g.id
                  ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                  : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 leading-tight">{g.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="mb-4 p-3 rounded-xl" style={{ background: goal?.color + '15', borderLeft: `4px solid ${goal?.color}` }}>
            <p className="text-lg font-bold text-slate-700">{goal?.label}</p>
            <p className="text-sm text-slate-400">{goal?.hint}</p>
          </div>

          <p className="text-lg font-bold text-slate-700 mb-1">💰 What is the cost in today's money?</p>
          <p className="text-sm text-slate-400 mb-4">We'll automatically inflate it for you.</p>
          <SliderInput label="Goal Amount (Today's Value)" value={goalAmount} min={100000} max={50000000} step={100000} onChange={setGoalAmount} prefix="₹" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ When do you need this money?</p>
          <SliderInput label="Years to Goal" value={years} min={1} max={30} onChange={setYears} unit=" yrs" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 Investment return expected?</p>
          <SliderInput label="Expected Annual Return" value={expectedReturn} min={5} max={20} step={0.5} onChange={setExpectedReturn} unit="%" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Inflation assumption?</p>
          <SliderInput label="Expected Inflation" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} unit="%" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">🏦 Money already saved for this goal?</p>
          <SliderInput label="Current Savings (for this goal)" value={currentSavings} min={0} max={goalAmount} step={10000} onChange={setCurrentSavings} prefix="₹" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card border-0 text-white" style={{ background: `linear-gradient(135deg, ${goal?.color}, ${goal?.color}dd)` }}>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Actual Goal Amount in {years} yrs</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.futureGoalAmount)}</p>
            <p className="text-sm opacity-75 mt-1">Today: {formatINR(goalAmount)} → Inflation-adjusted</p>
          </div>

          <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Monthly SIP Required</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.sipRequired)}/mo</p>
            <p className="text-sm opacity-75 mt-1">at {expectedReturn}% return for {years} years</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3 bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-500 font-bold">Lumpsum Alternative</p>
              <p className="text-xl font-black text-blue-700">{formatINR(result.lumpsumRequired)}</p>
              <p className="text-xs text-blue-400">Invest today</p>
            </div>
            <div className="card p-3 bg-emerald-50 border-emerald-100">
              <p className="text-xs text-emerald-500 font-bold">Savings Contribution</p>
              <p className="text-xl font-black text-emerald-700">{formatINR(result.growthOfCurrentSavings)}</p>
              <p className="text-xs text-emerald-400">From existing savings</p>
            </div>
          </div>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-bold text-slate-600 mb-2">Funding Breakdown</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={3}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Goal Insights</p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              🎯 Inflation turns {formatINR(goalAmount)} → {formatINR(result.futureGoalAmount)} in {years} yrs
            </p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              📈 {formatINR(result.sipRequired)}/mo for {years} yrs builds your {goal?.icon} dream!
            </p>
            {result.sipRequired < 5000 && <p className="text-sm text-emerald-700 font-medium">✅ Very achievable! Start a SIP today.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
