import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcLumpsumYearly, formatINR, calcMultipleTime } from '../../utils/financialCalc';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function LumpsumCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const data = useMemo(() => calcLumpsumYearly(principal, rate, years), [principal, rate, years]);
  const result = data[data.length - 1] || { corpus: 0, invested: principal, gains: 0 };

  const doubleYear = useMemo(() => Math.ceil(calcMultipleTime(2, rate)), [rate]);
  const tripleYear = useMemo(() => Math.ceil(calcMultipleTime(3, rate)), [rate]);
  const tenXYear = useMemo(() => Math.ceil(calcMultipleTime(10, rate)), [rate]);

  const insights = useMemo(() => {
    const msgs = [];
    const multiple = result.corpus / principal;
    if (multiple >= 2) msgs.push(`🎯 Money doubled ${Math.floor(multiple / 2)} time${Math.floor(multiple / 2) > 1 ? 's' : ''} in ${years} years!`);
    if (doubleYear <= years) msgs.push(`⏱ At ${rate}%, money doubles every ${doubleYear} years`);
    if (rate >= 12 && years >= 15) msgs.push(`🔥 Long-term equity returns can turn ₹1L → ₹${Math.round(result.corpus / 100000)}L!`);
    return msgs;
  }, [result, principal, rate, years, doubleYear]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Lumpsum Calculator</h2>
        <p className="text-slate-500 mt-1">Got a bonus, inheritance or savings? See how it can grow!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="card">
          <div className="mb-6">
            <p className="text-lg font-bold text-slate-700 mb-1">💰 How much are you investing today?</p>
            <p className="text-sm text-slate-400">One-time investment. No monthly commitments.</p>
          </div>
          <SliderInput label="Lumpsum Investment" value={principal} min={10000} max={10000000} step={10000} onChange={setPrincipal} prefix="₹" hint="Your one-time investment amount" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 Expected annual growth rate?</p>
          <p className="text-sm text-slate-400 mb-4">Nifty 50 avg CAGR (20yr): ~15%, FD: ~7%</p>
          <SliderInput label="Annual Return (CAGR)" value={rate} min={4} max={25} step={0.5} onChange={setRate} unit="%" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ Leave it untouched for how long?</p>
          <p className="text-sm text-slate-400 mb-4">Compounding gets magical after 10 years.</p>
          <SliderInput label="Investment Duration" value={years} min={1} max={40} onChange={setYears} unit=" yrs" />

          {/* Money milestone cards */}
          <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">💡 Money Milestones at {rate}% CAGR</p>
            <div className="space-y-2">
              {[{ label: '2x (Double)', year: doubleYear }, { label: '3x (Triple)', year: tripleYear }, { label: '10x', year: tenXYear }].map(m => (
                <div key={m.label} className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">{m.label}</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg ${m.year <= years ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {m.year <= 50 ? `Year ${m.year}` : '50+ yrs'}
                    {m.year <= years && ' ✓'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-violet-600 to-violet-700 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Future Value</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.corpus)}</p>
            <p className="text-sm opacity-75 mt-1">after {years} years at {rate}% CAGR</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">You Invest</p>
              <p className="text-2xl font-black text-blue-700 mt-1">{formatINR(principal)}</p>
              <p className="text-xs text-blue-500 mt-1">Today, once</p>
            </div>
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Wealth Created</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(result.gains)}</p>
              <p className="text-xs text-emerald-500 mt-1">Pure market returns</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center p-3 bg-orange-50 border-orange-100">
              <p className="text-xs text-orange-500 font-bold">Multiplied</p>
              <p className="text-xl font-black text-orange-700">{(result.corpus / principal).toFixed(1)}x</p>
            </div>
            <div className="card text-center p-3 bg-amber-50 border-amber-100">
              <p className="text-xs text-amber-500 font-bold">Total Gains</p>
              <p className="text-xl font-black text-amber-700">{result.corpus > 0 ? Math.round(result.gains / result.corpus * 100) : 0}%</p>
            </div>
            <div className="card text-center p-3 bg-violet-50 border-violet-100">
              <p className="text-xs text-violet-500 font-bold">CAGR</p>
              <p className="text-xl font-black text-violet-700">{rate}%</p>
            </div>
          </div>

          {insights.length > 0 && (
            <div className="card bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-2">💡 Key Insights</p>
              {insights.map((ins, i) => (
                <p key={i} className="text-sm text-violet-800 font-medium mb-1">{ins}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="card mt-6">
        <div className="mb-4">
          <h3 className="font-bold text-slate-700">Growth Trajectory</h3>
          <p className="text-xs text-slate-400">See how compounding accelerates wealth in later years</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="lumpsumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip content={<CustomTooltip />} />
            {doubleYear <= years && <ReferenceLine x={doubleYear} stroke="#f97316" strokeDasharray="4 4" label={{ value: '2x', fill: '#f97316', fontSize: 11 }} />}
            {tripleYear <= years && <ReferenceLine x={tripleYear} stroke="#10b981" strokeDasharray="4 4" label={{ value: '3x', fill: '#10b981', fontSize: 11 }} />}
            <Area type="monotone" dataKey="corpus" name="Future Value" stroke="#7c3aed" strokeWidth={2.5} fill="url(#lumpsumGrad)" />
            <Area type="monotone" dataKey="invested" name="Principal" stroke="#3b82f6" strokeWidth={2} fill="url(#principalGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
