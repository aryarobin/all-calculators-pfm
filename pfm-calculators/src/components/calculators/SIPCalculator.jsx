import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIPYearly, formatINR, calcSIP } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-1">Year {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6 mb-0.5">
          <span className="text-slate-400">{p.name}</span>
          <span className="font-bold" style={{ color: p.color }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const RATES = [['FD', 7], ['PPF', 7.1], ['Equity MF', 12], ['Nifty 50', 13.5], ['Small Cap', 16]];

export default function SIPCalculator({ onNavigate }) {
  const [s, set] = useCalcState('sip', { monthly: 5000, rate: 12, years: 15 });
  const [showAdv, setShowAdv] = useState(false);

  const data = useMemo(() => calcSIPYearly(s.monthly, s.rate, s.years), [s]);
  const res = data[data.length - 1] || { corpus: 0, invested: 0, gains: 0 };
  const gainsPct = res.corpus > 0 ? Math.round(res.gains / res.corpus * 100) : 0;
  const multiple = res.invested > 0 ? (res.corpus / res.invested).toFixed(1) : '—';

  const extra500 = useMemo(() => formatINR(calcSIP(s.monthly + 500, s.rate, s.years).corpus - res.corpus), [s, res.corpus]);
  const delay5 = useMemo(() => formatINR(res.corpus - calcSIP(s.monthly, s.rate, Math.max(1, s.years - 5)).corpus), [s, res.corpus]);

  return (
    <div className="space-y-4">
      {/* Story + hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">SIP Calculator</p>
          <p className="text-lg font-semibold text-slate-700 leading-snug">
            Investing <span className="text-blue-700 font-bold">{formatINR(s.monthly)}/mo</span> at <span className="text-blue-700 font-bold">{s.rate}%</span> for <span className="text-blue-700 font-bold">{s.years} years</span>
          </p>
        </div>
        <div className="px-6 pb-4">
          <div className="flex items-end gap-6 flex-wrap mt-2">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Total Corpus</p>
              <p className="text-5xl font-black text-blue-700 leading-none tabular-nums">{formatINR(res.corpus)}</p>
            </div>
            <div className="flex gap-6 pb-1">
              <div>
                <p className="text-xs text-slate-400">Invested</p>
                <p className="text-xl font-bold text-slate-600 tabular-nums">{formatINR(res.invested)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Returns</p>
                <p className="text-xl font-bold text-emerald-600 tabular-nums">{formatINR(res.gains)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Multiple</p>
                <p className="text-xl font-bold text-slate-600">{multiple}×</p>
              </div>
            </div>
          </div>
          {/* Invested vs returns bar */}
          <div className="mt-4">
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${100 - gainsPct}%` }} />
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${gainsPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>Invested {100 - gainsPct}%</span>
              <span>Returns {gainsPct}%</span>
            </div>
          </div>
        </div>
        {/* Insight strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
          {[
            { label: '+₹500/mo gives extra', val: extra500 },
            { label: 'Lost by delaying 5 yrs', val: delay5 },
            { label: 'Wealth multiplied', val: `${multiple}×` },
          ].map(item => (
            <div key={item.label} className="px-4 py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5 tabular-nums">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
        <SliderInput label="Monthly SIP" hint="How much you invest every month" value={s.monthly} min={500} max={500000} step={500} onChange={v => set({ monthly: v })} prefix="₹" />
        <SliderInput label="Expected Annual Return" hint="Equity MF historical avg: 12–15%" value={s.rate} min={4} max={30} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        <SliderInput label="Duration" hint="Time is your biggest wealth multiplier" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
        <div className="mt-1">
          <button onClick={() => setShowAdv(!showAdv)} className="text-xs text-blue-600 font-semibold hover:text-blue-800">
            {showAdv ? 'Hide benchmarks ↑' : 'See return benchmarks ↓'}
          </button>
          {showAdv && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {RATES.map(([label, r]) => (
                <button key={label} onClick={() => set({ rate: r })}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${s.rate === r ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'}`}>
                  <p className={s.rate === r ? 'text-blue-100' : 'text-slate-500'}>{label}</p>
                  <p className={`font-bold text-sm ${s.rate === r ? 'text-white' : 'text-blue-700'}`}>{r}%</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-slate-700">Corpus growth — {s.years} year projection</p>
          <div className="flex gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-blue-600 inline-block" />Corpus</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />Invested</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sipC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="sipI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <Area type="monotone" dataKey="corpus" name="Corpus" stroke="#1d4ed8" strokeWidth={2.5} fill="url(#sipC)" dot={false} />
            <Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" strokeWidth={2} fill="url(#sipI)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Year-by-Year Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-100">
              {['Year', 'Invested', 'Returns', 'Corpus', 'Multiple'].map(h => <th key={h} className="text-left pb-2 pr-4 text-slate-400 font-semibold uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {data.filter((_, i) => [0,1,2,4,6,9,14,19,24,29,39].includes(i) || i === data.length-1).map(row => (
                <tr key={row.year} className={`border-b border-slate-50 hover:bg-slate-50 ${row.year === s.years ? 'font-semibold bg-blue-50/50' : ''}`}>
                  <td className="py-2 pr-4 text-slate-500">Yr {row.year}</td>
                  <td className="py-2 pr-4 text-slate-600 tabular-nums">{formatINR(row.invested)}</td>
                  <td className="py-2 pr-4 text-emerald-600 tabular-nums">{formatINR(row.gains)}</td>
                  <td className="py-2 pr-4 text-blue-700 font-semibold tabular-nums">{formatINR(row.corpus)}</td>
                  <td className="py-2 text-slate-500">{row.invested > 0 ? `${(row.corpus/row.invested).toFixed(1)}×` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'stepup', label: 'Step-Up SIP', desc: 'Increase SIP yearly with salary hikes' },
        { id: 'compare', label: 'Compare Instruments', desc: 'FD vs PPF vs Equity — side by side' },
        { id: 'goal', label: 'Plan a Goal', desc: 'Work backward from a target corpus' },
      ]} />
    </div>
  );
}
