import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import GlowBar from '../shared/GlowBar';
import WealthContext from '../shared/WealthContext';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIPYearly, formatINR, calcSIP } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5 text-[13px]">Year {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-8 mb-0.5">
          <span className="text-slate-400">{p.name}</span>
          <span className="font-bold tabular-nums" style={{ color: p.color }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const RATES = [
  { label: 'Savings A/c', rate: 3.5 },
  { label: 'Bank FD', rate: 7 },
  { label: 'PPF', rate: 7.1 },
  { label: 'Equity MF', rate: 12 },
  { label: 'Nifty 50', rate: 13.5 },
];

export default function SIPCalculator({ onNavigate }) {
  const [s, set] = useCalcState('sip', { monthly: 5000, rate: 12, years: 15 });
  const [showBench, setShowBench] = useState(false);

  const data = useMemo(() => calcSIPYearly(s.monthly, s.rate, s.years), [s]);
  const res  = data[data.length - 1] || { corpus: 0, invested: 0, gains: 0 };
  const gainsPct  = res.corpus > 0 ? Math.round(res.gains / res.corpus * 100) : 0;
  const multiple  = res.invested > 0 ? (res.corpus / res.invested).toFixed(1) : '—';

  const extra500  = useMemo(() => formatINR(calcSIP(s.monthly + 500, s.rate, s.years).corpus - res.corpus), [s, res.corpus]);
  const delay5loss = useMemo(() => {
    const withDelay = calcSIP(s.monthly, s.rate, Math.max(1, s.years - 5)).corpus;
    return formatINR(res.corpus - withDelay);
  }, [s, res.corpus]);

  const tickInterval = Math.max(1, Math.floor(s.years / 8));

  // The year your returns overtake the money you put in — a powerful moment
  const crossoverYear = useMemo(() => {
    const hit = data.find(d => d.gains > d.invested);
    return hit ? hit.year : null;
  }, [data]);

  return (
    <div className="space-y-4">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <HeroCard
        label={`SIP of ${formatINR(s.monthly)}/mo · ${s.rate}% · ${s.years} yrs`}
        value={res.corpus}
        gradient="blue"
        meta={[
          { label: 'You Invest', value: formatINR(res.invested) },
          { label: 'Returns',    value: formatINR(res.gains) },
          { label: 'Multiplied', value: `${multiple}×` },
        ]}
      />

      {/* ── Glow bar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <GlowBar pct={gainsPct} leftLabel="Your money" rightLabel="Market returns" />
      </div>

      {/* ── Insight strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: '+₹500/mo adds', val: extra500, color: 'text-emerald-600' },
          { label: 'Lost starting 5 yrs late', val: delay5loss, color: 'text-rose-500' },
          { label: 'Wealth multiple', val: `${multiple}×`, color: 'text-blue-700' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 px-2.5 sm:px-4 py-3 text-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight mb-1">{item.label}</p>
            <p className={`text-sm sm:text-base font-black tabular-nums ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* ── Sliders ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
        <SliderInput label="Monthly SIP" hint="Tap value to type any amount" value={s.monthly} min={500} max={500000} step={500} onChange={v => set({ monthly: v })} prefix="₹" />
        <SliderInput label="Expected Annual Return" hint="Historical equity MF avg: 12–15%" value={s.rate} min={4} max={30} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        <SliderInput label="Duration" hint="Time is the greatest multiplier" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />

        <button onClick={() => setShowBench(b => !b)} className="text-xs text-blue-600 font-semibold hover:text-blue-800 mt-1">
          {showBench ? 'Hide benchmarks ↑' : 'See return benchmarks ↓'}
        </button>
        {showBench && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
            {RATES.map(({ label, rate }) => (
              <button key={label} onClick={() => set({ rate })}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${s.rate === rate ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}>
                <p className={`text-[10px] font-semibold mb-0.5 ${s.rate === rate ? 'text-blue-200' : 'text-slate-400'}`}>{label}</p>
                <p className={`font-black text-sm ${s.rate === rate ? 'text-white' : 'text-blue-700'}`}>{rate}%</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Chart ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Corpus growth · {s.years} year projection</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-blue-600 inline-block" />Corpus</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />Invested</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sipCorpus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="90%" stopColor="#2563eb" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="sipInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="90%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`}
              axisLine={false} tickLine={false} interval={tickInterval} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)}
              width={68} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            {crossoverYear && crossoverYear < s.years && (
              <ReferenceLine x={crossoverYear} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: `Yr ${crossoverYear}: returns > invested`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
            )}
            <Area type="monotone" dataKey="corpus"   name="Corpus"   stroke="#2563eb" strokeWidth={2.5} fill="url(#sipCorpus)"   dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
            <Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" strokeWidth={2}   fill="url(#sipInvested)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Year table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Year-by-Year Breakdown</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Year', 'Invested', 'Returns', 'Corpus', '×'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 last:pr-0 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.filter((_, i) => [0,1,2,4,6,9,14,19,24,29,39].includes(i) || i === data.length - 1).map(row => (
                <tr key={row.year} className={`border-b border-slate-50 transition-colors hover:bg-slate-50 ${row.year === s.years ? 'bg-blue-50 font-semibold' : ''}`}>
                  <td className="py-2.5 pr-4 text-slate-500">Yr {row.year}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-slate-600">{formatINR(row.invested)}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-emerald-600">{formatINR(row.gains)}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-blue-700 font-bold">{formatINR(row.corpus)}</td>
                  <td className="py-2.5 text-slate-400">{row.invested > 0 ? `${(row.corpus / row.invested).toFixed(1)}×` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── What this means ────────────────────────────────────────── */}
      <WealthContext corpus={res.corpus} monthlyExpense={s.monthly * 2} />

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'stepup',  label: 'Step-Up SIP',          desc: 'Increase SIP yearly with salary hikes' },
        { id: 'compare', label: 'Compare Instruments',   desc: 'FD vs PPF vs Equity — side by side' },
        { id: 'goal',    label: 'Plan a Goal',           desc: 'Work backward from a target corpus' },
      ]} />
    </div>
  );
}
