import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcSIPYearly, formatINR, calcSIP } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow p-2.5 text-xs">
      <p className="font-semibold text-slate-600 mb-1">Year {label}</p>
      {payload.map(p => <div key={p.name} className="flex justify-between gap-5"><span className="text-slate-400">{p.name}</span><span className="font-semibold" style={{ color: p.color }}>{formatINR(p.value)}</span></div>)}
    </div>
  );
};

export default function SIPCalculator({ onNavigate }) {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const data = useMemo(() => calcSIPYearly(monthly, rate, years), [monthly, rate, years]);
  const result = data[data.length - 1] || { corpus: 0, invested: 0, gains: 0 };
  const gainsPct = result.corpus > 0 ? Math.round(result.gains / result.corpus * 100) : 0;
  const extraWith500 = useMemo(() => calcSIP(monthly + 500, rate, years).corpus - result.corpus, [monthly, rate, years, result.corpus]);

  return (
    <div className="space-y-4">
      {/* Story header */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Scenario</p>
          <p className="text-xl font-bold text-slate-800 leading-snug">
            Investing <span className="text-blue-700">{formatINR(monthly)}</span> every month for <span className="text-blue-700">{years} years</span> at <span className="text-blue-700">{rate}%</span> annual return
          </p>
        </div>

        {/* Big result */}
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-400 font-medium mb-1">Your corpus will be</p>
          <p className="text-5xl font-black text-blue-700 leading-none">{formatINR(result.corpus)}</p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-xs text-slate-400">You invest</p>
              <p className="text-base font-bold text-slate-700">{formatINR(result.invested)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Returns</p>
              <p className="text-base font-bold text-emerald-600">{formatINR(result.gains)} ({gainsPct}%)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Multiplied</p>
              <p className="text-base font-bold text-slate-700">{result.invested > 0 ? (result.corpus / result.invested).toFixed(1) : '—'}×</p>
            </div>
          </div>
        </div>

        {/* Progress bar — gains vs invested */}
        <div className="px-6 pb-5">
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
            <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${100 - gainsPct}%` }}></div>
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${gainsPct}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Invested: {100 - gainsPct}%</span>
            <span>Returns: {gainsPct}%</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Adjust Parameters</p>

        <SliderInput label="Monthly SIP Amount" hint="How much you invest every month" value={monthly} min={500} max={100000} step={500} onChange={setMonthly} prefix="₹" />
        <SliderInput label="Annual Return Rate" hint="Equity MF historical avg: 12–15%" value={rate} min={4} max={20} step={0.5} onChange={setRate} unit="%" />
        <SliderInput label="Duration" hint="Time in the market determines wealth" value={years} min={1} max={40} onChange={setYears} unit=" yr" />

        {/* Insight callout */}
        {extraWith500 > 0 && (
          <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">
              Increasing SIP by just <strong>₹500/month</strong> adds <strong>{formatINR(extraWith500)}</strong> to your final corpus.
            </p>
          </div>
        )}

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-4 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors">
          {showAdvanced ? 'Hide benchmarks' : 'See return rate benchmarks'} {showAdvanced ? '↑' : '↓'}
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['Savings Account', 3.5], ['Bank FD', 7], ['PPF', 7.1], ['Equity MF', 12]].map(([label, r]) => (
              <button key={label} onClick={() => setRate(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${rate === r ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                <p className={rate === r ? 'text-white' : 'text-slate-800'}>{label}</p>
                <p className={`font-bold mt-0.5 ${rate === r ? 'text-blue-100' : 'text-blue-700'}`}>{r}%</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Corpus growth — {years} year projection</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sipCorpus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="sipInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={65} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <Area type="monotone" dataKey="corpus" name="Total Corpus" stroke="#1d4ed8" strokeWidth={2} fill="url(#sipCorpus)" />
            <Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" strokeWidth={1.5} fill="url(#sipInvested)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Next step CTA */}
      {onNavigate && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">What would you like to explore next?</p>
          <p className="text-xs text-slate-400 mb-4">Each tool builds on this — step-up shows you what happens when you increase SIP yearly.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'stepup', label: 'Step-Up SIP', desc: 'Increase SIP by 10% yearly' },
              { id: 'compare', label: 'Compare Instruments', desc: 'FD vs MF vs PPF side by side' },
              { id: 'goal', label: 'Plan a Goal', desc: 'Home, education, retirement' },
            ].map(n => (
              <button key={n.id} onClick={() => onNavigate(n.id)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group">
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
