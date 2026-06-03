import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcMultipleTime, calcRateForMultiple, formatINR, ruleOf72 } from '../../utils/financialCalc';

const MULTIPLES = [
  { label: '2x', value: 2, color: '#3b82f6', emoji: '2️⃣' },
  { label: '3x', value: 3, color: '#10b981', emoji: '3️⃣' },
  { label: '5x', value: 5, color: '#f59e0b', emoji: '5️⃣' },
  { label: '10x', value: 10, color: '#f97316', emoji: '🔟' },
  { label: '20x', value: 20, color: '#7c3aed', emoji: '💎' },
  { label: '100x', value: 100, color: '#ef4444', emoji: '🚀' },
];

export default function MoneyMultiplier() {
  const [mode, setMode] = useState('time-for-multiple'); // 'time-for-multiple' | 'rate-for-multiple'
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [targetMultiple, setTargetMultiple] = useState(10);
  const [yearsTarget, setYearsTarget] = useState(10);

  const timeToMultiple = useMemo(() => calcMultipleTime(targetMultiple, rate), [targetMultiple, rate]);
  const rateNeeded = useMemo(() => calcRateForMultiple(targetMultiple, yearsTarget), [targetMultiple, yearsTarget]);
  const rule72 = useMemo(() => ruleOf72(rate), [rate]);

  // Chart data: growth at the given rate
  const chartData = useMemo(() => {
    const maxYears = Math.min(50, Math.ceil(timeToMultiple * 1.2 + 5));
    return Array.from({ length: maxYears }, (_, i) => {
      const yr = i + 1;
      return { year: yr, value: Math.round(amount * Math.pow(1 + rate / 100, yr)) };
    });
  }, [amount, rate, timeToMultiple]);

  // All milestones at current rate
  const milestones = useMemo(() => MULTIPLES.map(m => ({
    ...m,
    years: calcMultipleTime(m.value, rate),
    futureValue: amount * m.value,
  })), [rate, amount]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Money Multiplier</h2>
        <p className="text-slate-500 mt-1">When will your money 2x, 5x, 10x? Or what return do you need?</p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
        {[['time-for-multiple', '⏱ Time to Multiply'], ['rate-for-multiple', '📈 Rate Needed']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          {mode === 'time-for-multiple' ? (
            <>
              <p className="text-lg font-bold text-slate-700 mb-1">💰 How much are you starting with?</p>
              <SliderInput label="Starting Amount" value={amount} min={10000} max={10000000} step={10000} onChange={setAmount} prefix="₹" />

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 At what annual return?</p>
              <SliderInput label="Expected CAGR" value={rate} min={4} max={25} step={0.5} onChange={setRate} unit="%" hint={`Rule of 72: Money doubles in ~${rule72.toFixed(0)} years`} />

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">🎯 By how much do you want to multiply?</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MULTIPLES.slice(0, 6).map(m => (
                  <button key={m.value} onClick={() => setTargetMultiple(m.value)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${targetMultiple === m.value ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              <SliderInput label="Target Multiple" value={targetMultiple} min={2} max={100} step={1} onChange={setTargetMultiple} unit="x" />
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-700 mb-1">💰 Starting Amount</p>
              <SliderInput label="Starting Amount" value={amount} min={10000} max={10000000} step={10000} onChange={setAmount} prefix="₹" />

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">🎯 Target Multiple</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MULTIPLES.slice(0, 6).map(m => (
                  <button key={m.value} onClick={() => setTargetMultiple(m.value)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${targetMultiple === m.value ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ In how many years?</p>
              <SliderInput label="Time Available" value={yearsTarget} min={1} max={40} onChange={setYearsTarget} unit=" yrs" />
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === 'time-for-multiple' ? (
            <>
              <div className="card bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Time to {targetMultiple}x</p>
                <p className="text-4xl font-black mt-1">
                  {isFinite(timeToMultiple) ? `${timeToMultiple.toFixed(1)} yrs` : '∞'}
                </p>
                <p className="text-sm opacity-75 mt-1">
                  {formatINR(amount)} → {formatINR(amount * targetMultiple)} at {rate}% CAGR
                </p>
              </div>
              <div className="card bg-amber-50 border-amber-100">
                <p className="text-xs font-bold text-amber-600 mb-1">⚡ Rule of 72</p>
                <p className="text-sm text-amber-800">At {rate}%, money doubles every <strong>{rule72.toFixed(1)} years</strong></p>
              </div>
            </>
          ) : (
            <div className="card bg-gradient-to-br from-violet-600 to-violet-700 text-white border-0">
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">CAGR Needed for {targetMultiple}x in {yearsTarget} yrs</p>
              <p className="text-4xl font-black mt-1">{rateNeeded.toFixed(1)}%</p>
              <p className="text-sm opacity-75 mt-1">{formatINR(amount)} → {formatINR(amount * targetMultiple)}</p>
            </div>
          )}

          {/* All Milestones */}
          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {mode === 'time-for-multiple' ? `All Milestones at ${rate}% CAGR` : `Rate needed for each milestone in ${yearsTarget} yrs`}
            </p>
            <div className="space-y-2">
              {milestones.map(m => {
                const highlight = m.value === targetMultiple;
                const rateN = calcRateForMultiple(m.value, yearsTarget);
                return (
                  <div key={m.value} onClick={() => setTargetMultiple(m.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${highlight ? 'bg-orange-50 border-2 border-orange-300' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black text-white"
                      style={{ background: m.color }}>{m.emoji}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-700">{m.label} → {formatINR(m.futureValue)}</p>
                      <p className="text-xs text-slate-400">
                        {mode === 'time-for-multiple'
                          ? `${m.years.toFixed(1)} years at ${rate}%`
                          : `needs ${rateN.toFixed(1)}% CAGR in ${yearsTarget} yrs`}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${m.years <= (mode === 'time-for-multiple' ? 50 : Infinity) ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card mt-6">
        <h3 className="font-bold text-slate-700 mb-4">Growth Trajectory with {targetMultiple}x Milestone</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={(v) => [formatINR(v), 'Value']} labelFormatter={l => `Year ${l}`} />
            <ReferenceLine y={amount * targetMultiple} stroke="#f97316" strokeDasharray="5 5"
              label={{ value: `${targetMultiple}x target`, fill: '#f97316', fontSize: 11 }} />
            {isFinite(timeToMultiple) && timeToMultiple <= chartData.length &&
              <ReferenceLine x={Math.round(timeToMultiple)} stroke="#10b981" strokeDasharray="4 4"
                label={{ value: `${timeToMultiple.toFixed(1)}yr`, fill: '#10b981', fontSize: 11 }} />}
            <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Value" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
