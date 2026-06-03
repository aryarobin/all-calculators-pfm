import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcCAGR, calcFutureValue, calcMultipleTime, formatINR, formatPercent } from '../../utils/financialCalc';

export default function CAGRCalculator() {
  const [mode, setMode] = useState('find-cagr'); // 'find-cagr' | 'find-future' | 'compare'
  const [startValue, setStartValue] = useState(100000);
  const [endValue, setEndValue] = useState(500000);
  const [years, setYears] = useState(10);
  const [principal, setPrincipal] = useState(100000);
  const [cagr, setCagr] = useState(12);
  const [targetYears, setTargetYears] = useState(15);

  const calculatedCAGR = useMemo(() => calcCAGR(startValue, endValue, years), [startValue, endValue, years]);
  const futureValue = useMemo(() => calcFutureValue(principal, cagr, targetYears), [principal, cagr, targetYears]);

  // Compare different rates
  const compareData = useMemo(() => {
    const rates = [6, 8, 10, 12, 15, 18];
    return Array.from({ length: targetYears }, (_, i) => {
      const yr = i + 1;
      const row = { year: yr };
      rates.forEach(r => { row[`${r}%`] = Math.round(calcFutureValue(principal, r, yr)); });
      return row;
    });
  }, [principal, targetYears]);

  const RATE_COLORS = { '6%': '#94a3b8', '8%': '#3b82f6', '10%': '#10b981', '12%': '#f97316', '15%': '#7c3aed', '18%': '#ef4444' };

  const doubleAt = useMemo(() => Math.ceil(calcMultipleTime(2, calculatedCAGR)), [calculatedCAGR]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">CAGR Calculator</h2>
        <p className="text-slate-500 mt-1">Compounded Annual Growth Rate — the true measure of investment performance</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
        {[['find-cagr', 'Find CAGR'], ['find-future', 'Future Value'], ['compare', 'Compare Rates']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mode === 'find-cagr' && (
          <>
            <div className="card">
              <p className="text-lg font-bold text-slate-700 mb-1">📊 What was the starting value?</p>
              <p className="text-sm text-slate-400 mb-4">e.g. NAV, portfolio value, stock price</p>
              <SliderInput label="Starting Value" value={startValue} min={1000} max={10000000} step={1000} onChange={setStartValue} prefix="₹" />

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">🎯 What is it worth now?</p>
              <SliderInput label="Ending Value" value={endValue} min={startValue} max={50000000} step={1000} onChange={v => setEndValue(Math.max(startValue, v))} prefix="₹" />

              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏱ Over how many years?</p>
              <SliderInput label="Time Period" value={years} min={1} max={30} onChange={setYears} unit=" yrs" />
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">CAGR (Compounded Annual Return)</p>
                <p className="text-5xl font-black mt-2">{formatPercent(calculatedCAGR)}</p>
                <p className="text-sm opacity-75 mt-1">per year, compounded</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 bg-emerald-50 border-emerald-100">
                  <p className="text-xs text-emerald-500 font-bold">Total Gain</p>
                  <p className="text-xl font-black text-emerald-700">{formatINR(endValue - startValue)}</p>
                  <p className="text-xs text-emerald-400">{((endValue / startValue - 1) * 100).toFixed(0)}% absolute</p>
                </div>
                <div className="card p-4 bg-blue-50 border-blue-100">
                  <p className="text-xs text-blue-500 font-bold">Multiplied</p>
                  <p className="text-xl font-black text-blue-700">{(endValue / startValue).toFixed(1)}x</p>
                  <p className="text-xs text-blue-400">in {years} years</p>
                </div>
              </div>

              <div className="card bg-slate-50 border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Benchmark Comparison</p>
                {[{ label: 'Bank FD', rate: 7 }, { label: 'PPF', rate: 7.1 }, { label: 'Equity MF', rate: 12 }, { label: 'Nifty 50 (20yr avg)', rate: 15 }].map(b => (
                  <div key={b.label} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{b.rate}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${calculatedCAGR > b.rate ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {calculatedCAGR > b.rate ? `+${(calculatedCAGR - b.rate).toFixed(1)}%` : `${(calculatedCAGR - b.rate).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card bg-amber-50 border-amber-100">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">💡 Insight</p>
                <p className="text-sm text-amber-800 font-medium">
                  At {formatPercent(calculatedCAGR)}, money doubles in ~{isFinite(doubleAt) ? `${doubleAt} years` : 'never'} (Rule of 72: 72/{formatPercent(calculatedCAGR)})
                </p>
              </div>
            </div>
          </>
        )}

        {mode === 'find-future' && (
          <>
            <div className="card">
              <p className="text-lg font-bold text-slate-700 mb-1">💰 How much to invest today?</p>
              <SliderInput label="Principal Amount" value={principal} min={10000} max={10000000} step={10000} onChange={setPrincipal} prefix="₹" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 At what CAGR?</p>
              <SliderInput label="Expected CAGR" value={cagr} min={4} max={25} step={0.5} onChange={setCagr} unit="%" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ For how many years?</p>
              <SliderInput label="Duration" value={targetYears} min={1} max={40} onChange={setTargetYears} unit=" yrs" />

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 mb-2">Quick Milestones</p>
                {[2, 3, 5, 10].map(m => (
                  <div key={m} className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">{m}x ({formatINR(principal * m)})</span>
                    <span className="text-sm font-bold text-blue-600">Year {Math.ceil(calcMultipleTime(m, cagr))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-violet-600 to-violet-700 text-white border-0">
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Future Value</p>
                <p className="text-4xl font-black mt-1">{formatINR(futureValue)}</p>
                <p className="text-sm opacity-75 mt-1">in {targetYears} yrs at {cagr}% CAGR</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 bg-emerald-50 border-emerald-100">
                  <p className="text-xs text-emerald-500 font-bold">Wealth Gained</p>
                  <p className="text-xl font-black text-emerald-700">{formatINR(futureValue - principal)}</p>
                </div>
                <div className="card p-4 bg-orange-50 border-orange-100">
                  <p className="text-xs text-orange-500 font-bold">Multiplied</p>
                  <p className="text-xl font-black text-orange-700">{(futureValue / principal).toFixed(1)}x</p>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'compare' && (
          <>
            <div className="card">
              <p className="text-lg font-bold text-slate-700 mb-1">💰 Starting Investment</p>
              <SliderInput label="Principal Amount" value={principal} min={10000} max={10000000} step={10000} onChange={setPrincipal} prefix="₹" />
              <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ Duration</p>
              <SliderInput label="Years" value={targetYears} min={1} max={40} onChange={setTargetYears} unit=" yrs" />

              <div className="mt-4 space-y-2">
                {Object.entries(RATE_COLORS).map(([rate, color]) => {
                  const r = parseInt(rate);
                  const fv = calcFutureValue(principal, r, targetYears);
                  return (
                    <div key={rate} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }}></div>
                      <span className="text-sm font-bold text-slate-600 w-8">{rate}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, fv / calcFutureValue(principal, 18, targetYears) * 100)}%`, background: color }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-20 text-right">{formatINR(fv)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-700 mb-4">Growth Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={compareData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={(v, n) => [formatINR(v), n]} />
                  <Legend iconType="circle" iconSize={8} />
                  {Object.entries(RATE_COLORS).map(([rate, color]) => (
                    <Line key={rate} type="monotone" dataKey={rate} stroke={color} strokeWidth={rate === '12%' ? 2.5 : 1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
