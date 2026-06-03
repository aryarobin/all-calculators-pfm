import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcInflation, calcPresentValue, calcRealReturn, formatINR } from '../../utils/financialCalc';

const INFLATION_EXAMPLES = [
  { item: '☕ Coffee', price2000: 10, growth: 6.5 },
  { item: '🎓 MBA (IIM)', price2000: 200000, growth: 12 },
  { item: '🏠 Mumbai Flat (1BHK)', price2000: 2000000, growth: 9 },
  { item: '🏥 Bypass Surgery', price2000: 150000, growth: 10 },
  { item: '✈️ Delhi-London Ticket', price2000: 35000, growth: 5 },
  { item: '🎓 Engineering College', price2000: 50000, growth: 11 },
];

export default function InflationCalculator() {
  const [mode, setMode] = useState('future'); // 'future' | 'present' | 'real-return'
  const [amount, setAmount] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [years, setYears] = useState(20);
  const [nominalReturn, setNominalReturn] = useState(12);

  const futureValue = useMemo(() => calcInflation(amount, inflation, years), [amount, inflation, years]);
  const presentValue = useMemo(() => calcPresentValue(amount, inflation, years), [amount, inflation, years]);
  const realReturn = useMemo(() => calcRealReturn(nominalReturn, inflation), [nominalReturn, inflation]);

  const chartData = useMemo(() => {
    return Array.from({ length: years }, (_, i) => ({
      year: i + 1,
      value: Math.round(calcInflation(amount, inflation, i + 1)),
      realValue: Math.round(amount),
    }));
  }, [amount, inflation, years]);

  const inflatedItems = useMemo(() =>
    INFLATION_EXAMPLES.map(e => ({
      ...e,
      today: Math.round(calcInflation(e.price2000, e.growth, 24)),
      future: Math.round(calcInflation(calcInflation(e.price2000, e.growth, 24), inflation, years)),
    })), [inflation, years]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Inflation Calculator</h2>
        <p className="text-slate-500 mt-1">Why ₹1,000 today won't feel like ₹1,000 in 10 years</p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
        {[['future', '🔮 Future Cost'], ['present', '⏮ Today\'s Value'], ['real-return', '📈 Real Returns']].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          {mode === 'future' && (
            <>
              <p className="text-lg font-bold text-slate-700 mb-1">💰 What costs ₹X today?</p>
              <p className="text-sm text-slate-400 mb-4">Monthly expenses, education fee, medical cost — anything.</p>
              <SliderInput label="Current Value / Cost" value={amount} min={1000} max={5000000} step={1000} onChange={setAmount} prefix="₹" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Expected inflation rate?</p>
              <SliderInput label="Annual Inflation" value={inflation} min={3} max={12} step={0.5} onChange={setInflation} unit="%" hint="India avg: 6% | Education: 10-12% | Medical: 8-10%" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ After how many years?</p>
              <SliderInput label="Years into Future" value={years} min={1} max={40} onChange={setYears} unit=" yrs" />
            </>
          )}
          {mode === 'present' && (
            <>
              <p className="text-lg font-bold text-slate-700 mb-1">🔮 What will you need in the future?</p>
              <p className="text-sm text-slate-400 mb-4">Enter the future amount — we'll tell you what it's worth today.</p>
              <SliderInput label="Future Amount Needed" value={amount} min={10000} max={50000000} step={10000} onChange={setAmount} prefix="₹" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Expected inflation rate?</p>
              <SliderInput label="Annual Inflation" value={inflation} min={3} max={12} step={0.5} onChange={setInflation} unit="%" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ How many years from now?</p>
              <SliderInput label="Years" value={years} min={1} max={40} onChange={setYears} unit=" yrs" />
            </>
          )}
          {mode === 'real-return' && (
            <>
              <p className="text-lg font-bold text-slate-700 mb-1">📈 What nominal return does your investment give?</p>
              <p className="text-sm text-slate-400 mb-4">FD gives 7%. But what's the real gain after inflation?</p>
              <SliderInput label="Nominal/Stated Return" value={nominalReturn} min={4} max={20} step={0.5} onChange={setNominalReturn} unit="%" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Expected inflation rate?</p>
              <SliderInput label="Annual Inflation" value={inflation} min={3} max={12} step={0.5} onChange={setInflation} unit="%" />

              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Real Returns Comparison</p>
                {[
                  { label: 'Savings Account', rate: 3.5 },
                  { label: 'Bank FD', rate: 7 },
                  { label: 'PPF', rate: 7.1 },
                  { label: 'Debt MF', rate: 7.5 },
                  { label: 'Equity MF', rate: 12 },
                ].map(item => {
                  const real = calcRealReturn(item.rate, inflation);
                  return (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-sm text-slate-500">{item.label} ({item.rate}%)</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${real > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {real > 0 ? '+' : ''}{real.toFixed(1)}% real
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === 'future' && (
            <>
              <div className="card bg-gradient-to-br from-red-500 to-rose-600 text-white border-0">
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Future Cost (after {years} yrs)</p>
                <p className="text-4xl font-black mt-1">{formatINR(futureValue)}</p>
                <p className="text-sm opacity-75 mt-1">Today: {formatINR(amount)} → {inflation}% inflation × {years} years</p>
              </div>
              <div className="card p-4 bg-amber-50 border-amber-200">
                <p className="text-xs font-bold text-amber-600">Inflation Impact</p>
                <p className="text-2xl font-black text-amber-700 mt-1">{formatINR(futureValue - amount)} extra</p>
                <p className="text-xs text-amber-500">More than what it costs today</p>
              </div>
              <div className="card bg-rose-50 border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">😱 Inflation Reality Check</p>
                <p className="text-sm text-rose-800 font-medium mb-1">Your {formatINR(amount)} today needs {formatINR(futureValue)} in {years} years</p>
                <p className="text-sm text-rose-800 font-medium">That's {(futureValue / amount).toFixed(1)}x the current cost!</p>
              </div>
            </>
          )}
          {mode === 'present' && (
            <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Today's Equivalent Value</p>
              <p className="text-4xl font-black mt-1">{formatINR(presentValue)}</p>
              <p className="text-sm opacity-75 mt-1">{formatINR(amount)} in {years} yrs = {formatINR(presentValue)} today's money</p>
            </div>
          )}
          {mode === 'real-return' && (
            <>
              <div className={`card border-0 text-white ${realReturn > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Real Return (After Inflation)</p>
                <p className="text-4xl font-black mt-1">{realReturn > 0 ? '+' : ''}{realReturn.toFixed(2)}%</p>
                <p className="text-sm opacity-75 mt-1">{nominalReturn}% nominal - {inflation}% inflation</p>
              </div>
              <div className="card bg-amber-50 border-amber-100">
                <p className="text-xs font-bold text-amber-600 mb-1">💡 What this means</p>
                <p className="text-sm text-amber-800">
                  {realReturn > 0
                    ? `✅ Great! Your purchasing power grows by ${realReturn.toFixed(1)}% per year.`
                    : `❌ Your purchasing power is shrinking! Inflation is eating your returns.`}
                </p>
              </div>
            </>
          )}

          {/* Inflation examples */}
          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Real World Inflation Examples ({years} yrs from now)</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inflatedItems.map(item => (
                <div key={item.item} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.item}</p>
                    <p className="text-xs text-slate-400">Today: {formatINR(item.today)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{formatINR(item.future)}</p>
                    <p className="text-xs text-slate-400">in {years} yrs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {mode !== 'real-return' && (
        <div className="card mt-6">
          <h3 className="font-bold text-slate-700 mb-4">Purchasing Power Erosion</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
              <Tooltip formatter={(v) => [formatINR(v)]} labelFormatter={l => `Year ${l}`} />
              <Area type="monotone" dataKey="value" name="Inflation-adjusted value" stroke="#ef4444" strokeWidth={2.5} fill="url(#inflGrad)" />
              <Area type="monotone" dataKey="realValue" name="Today's value" stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
