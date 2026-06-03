import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcInflation, calcPresentValue, calcRealReturn, formatINR } from '../../utils/financialCalc';

// ─── Real-world items (base price today + own growth rate) ─────────────────
const ITEMS = [
  { label: 'Coffee (Cafe)', icon: '☕', today: 200,    rate: 7   },
  { label: 'School Fees',   icon: '🎓', today: 120000, rate: 10  },
  { label: 'Hospital Bill', icon: '🏥', today: 80000,  rate: 9   },
  { label: 'Flight Ticket', icon: '✈️', today: 8000,   rate: 5.5 },
];

// ─── Instruments for Real Returns tab ────────────────────────────────────────
const INSTRUMENTS = [
  { label: 'Savings Account', rate: 3.5 },
  { label: 'Bank FD',         rate: 7   },
  { label: 'PPF',             rate: 7.1 },
  { label: 'Debt MF',         rate: 7.5 },
  { label: 'Equity MF',       rate: 12  },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
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

// ─── Mode Tab bar ─────────────────────────────────────────────────────────────
const MODES = [
  { id: 'future',  label: 'Future Cost'   },
  { id: 'present', label: "Today's Value" },
  { id: 'real',    label: 'Real Returns'  },
];

export default function InflationCalculator({ onNavigate }) {
  const [s, set] = useCalcState('inflation', {
    mode: 'future',
    amount: 50000,
    inflation: 6,
    years: 20,
    nominalReturn: 12,
  });

  // ─── Core calculations ──────────────────────────────────────────────────
  const futureValue  = useMemo(() => calcInflation(s.amount, s.inflation, s.years),     [s.amount, s.inflation, s.years]);
  const presentValue = useMemo(() => calcPresentValue(s.amount, s.inflation, s.years),  [s.amount, s.inflation, s.years]);
  const realReturn   = useMemo(() => calcRealReturn(s.nominalReturn, s.inflation),       [s.nominalReturn, s.inflation]);

  // ─── Chart data: nominal cost vs today's flat line ──────────────────────
  const chartData = useMemo(() => {
    const baseAmount = s.mode === 'present' ? s.amount : s.amount;
    const baseInflation = s.inflation;
    return Array.from({ length: s.years }, (_, i) => ({
      year: i + 1,
      inflated: Math.round(calcInflation(baseAmount, baseInflation, i + 1)),
      todayFlat: Math.round(baseAmount),
    }));
  }, [s.amount, s.inflation, s.years, s.mode]);

  // ─── Real-world examples adjusted to inflation + years ──────────────────
  const examples = useMemo(() =>
    ITEMS.map(it => ({
      ...it,
      future: Math.round(calcInflation(it.today, s.inflation, s.years)),
    })),
  [s.inflation, s.years]);

  const multiple = futureValue / s.amount;
  const fdRealReturn = calcRealReturn(7, s.inflation);

  return (
    <div className="space-y-4">

      {/* ── Mode Tabs ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex gap-1">
        {MODES.map(m => (
          <button key={m.id} onClick={() => set({ mode: m.id })}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              s.mode === m.id
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODE: FUTURE COST
      ══════════════════════════════════════════════════════ */}
      {s.mode === 'future' && (
        <>
          {/* Story hero */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Inflation Calculator</p>
              <p className="text-lg font-semibold text-slate-700 leading-snug">
                <span className="text-orange-600 font-bold">{formatINR(s.amount)}/mo</span> today becomes{' '}
                <span className="text-red-600 font-bold">{formatINR(futureValue)}/mo</span> in {s.years} years
              </p>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-end gap-6 flex-wrap mt-2">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Future Cost</p>
                  <p className="text-5xl font-black text-red-600 leading-none tabular-nums">{formatINR(futureValue)}</p>
                </div>
                <div className="flex gap-6 pb-1">
                  <div>
                    <p className="text-xs text-slate-400">Today's Value</p>
                    <p className="text-xl font-bold text-slate-600 tabular-nums">{formatINR(s.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Extra Needed</p>
                    <p className="text-xl font-bold text-red-500 tabular-nums">{formatINR(futureValue - s.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Multiplier</p>
                    <p className="text-xl font-bold text-slate-600">{multiple.toFixed(1)}×</p>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-slate-400 transition-all duration-500"
                    style={{ width: `${Math.round(100 / multiple)}%` }} />
                  <div className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${Math.round(100 - 100 / multiple)}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>Today {Math.round(100 / multiple)}%</span>
                  <span>Inflation erosion {Math.round(100 - 100 / multiple)}%</span>
                </div>
              </div>
            </div>
            {/* Insight strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
              {[
                { label: 'Annual inflation', val: `${s.inflation}%` },
                { label: 'Years', val: `${s.years} yrs` },
                { label: 'Cost multiplied', val: `${multiple.toFixed(1)}×` },
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
            <SliderInput label="Current Monthly Expense" hint="Your rent, fees, medical cost — any amount today" value={s.amount} min={1000} max={500000} step={1000} onChange={v => set({ amount: v })} prefix="₹" />
            <SliderInput label="Annual Inflation Rate" hint="India avg: 6% | Education: 10–12% | Medical: 8–10%" value={s.inflation} min={3} max={12} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
            <SliderInput label="Years into Future" hint="How many years ahead do you want to plan?" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
          </div>

          {/* Real World Examples table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">Real World Examples</p>
            <p className="text-xs text-slate-400 mb-4">All items at {s.inflation}% inflation for {s.years} years</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Item', 'Today', `In ${s.years} yrs`, 'Extra'].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {examples.map(it => (
                    <tr key={it.label} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 pr-4">
                        <span className="mr-1.5">{it.icon}</span>
                        <span className="text-slate-700 font-medium">{it.label}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 tabular-nums">{formatINR(it.today)}</td>
                      <td className="py-2.5 pr-4 text-red-600 font-bold tabular-nums">{formatINR(it.future)}</td>
                      <td className="py-2.5 text-slate-500 tabular-nums">+{formatINR(it.future - it.today)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Value Erosion Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-slate-700">Value erosion — {s.years} year projection</p>
              <div className="flex gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-red-500 inline-block" />Inflated cost</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-400 inline-block" />Today's value</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="inflFlat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
                <Tooltip content={<TTip />} />
                <Area type="monotone" dataKey="inflated"  name="Inflated cost"   stroke="#ef4444" strokeWidth={2.5} fill="url(#inflFuture)" dot={false} />
                <Area type="monotone" dataKey="todayFlat" name="Today's value"   stroke="#94a3b8" strokeWidth={1.5} fill="url(#inflFlat)"   dot={false} strokeDasharray="5 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          MODE: TODAY'S VALUE
      ══════════════════════════════════════════════════════ */}
      {s.mode === 'present' && (
        <>
          {/* Story hero */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Today's Value</p>
              <p className="text-lg font-semibold text-slate-700 leading-snug">
                <span className="text-orange-600 font-bold">{formatINR(s.amount)}</span> in {s.years} years is worth only{' '}
                <span className="text-blue-700 font-bold">{formatINR(presentValue)}</span> in today's money
              </p>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-end gap-6 flex-wrap mt-2">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Today's Equivalent</p>
                  <p className="text-5xl font-black text-blue-700 leading-none tabular-nums">{formatINR(presentValue)}</p>
                </div>
                <div className="flex gap-6 pb-1">
                  <div>
                    <p className="text-xs text-slate-400">Future Amount</p>
                    <p className="text-xl font-bold text-slate-600 tabular-nums">{formatINR(s.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Purchasing Loss</p>
                    <p className="text-xl font-bold text-red-500 tabular-nums">{formatINR(s.amount - presentValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Worth only</p>
                    <p className="text-xl font-bold text-slate-600">{Math.round(presentValue / s.amount * 100)}%</p>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.round(presentValue / s.amount * 100)}%` }} />
                  <div className="h-full bg-red-300 transition-all duration-500"
                    style={{ width: `${Math.round(100 - presentValue / s.amount * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>Real value {Math.round(presentValue / s.amount * 100)}%</span>
                  <span>Purchasing power lost {Math.round(100 - presentValue / s.amount * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
              {[
                { label: 'Annual inflation', val: `${s.inflation}%` },
                { label: 'Years', val: `${s.years} yrs` },
                { label: 'Value retained', val: `${Math.round(presentValue / s.amount * 100)}%` },
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
            <SliderInput label="Future Amount" hint="The amount you'll receive or need in the future" value={s.amount} min={10000} max={50000000} step={10000} onChange={v => set({ amount: v })} prefix="₹" />
            <SliderInput label="Annual Inflation Rate" hint="India avg: 6% | Education: 10–12% | Medical: 8–10%" value={s.inflation} min={3} max={12} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
            <SliderInput label="Years from Now" hint="When will you receive or need this amount?" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
          </div>

          {/* Real World Examples reverse */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">Real World Context</p>
            <p className="text-xs text-slate-400 mb-4">What future amounts mean in today's purchasing power</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Item', 'Today', `In ${s.years} yrs`, 'Difference'].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {examples.map(it => (
                    <tr key={it.label} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 pr-4">
                        <span className="mr-1.5">{it.icon}</span>
                        <span className="text-slate-700 font-medium">{it.label}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 tabular-nums">{formatINR(it.today)}</td>
                      <td className="py-2.5 pr-4 text-red-600 font-bold tabular-nums">{formatINR(it.future)}</td>
                      <td className="py-2.5 text-slate-500 tabular-nums">+{formatINR(it.future - it.today)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-slate-700">Purchasing power erosion — {s.years} years</p>
              <div className="flex gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-red-500 inline-block" />Inflated cost</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-400 inline-block" />Today's value</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="pvFlat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
                <Tooltip content={<TTip />} />
                <Area type="monotone" dataKey="inflated"  name="Inflated cost"  stroke="#ef4444" strokeWidth={2.5} fill="url(#pvFuture)" dot={false} />
                <Area type="monotone" dataKey="todayFlat" name="Today's value"  stroke="#94a3b8" strokeWidth={1.5} fill="url(#pvFlat)"   dot={false} strokeDasharray="5 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          MODE: REAL RETURNS
      ══════════════════════════════════════════════════════ */}
      {s.mode === 'real' && (
        <>
          {/* Story hero */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Real Returns</p>
              <p className="text-lg font-semibold text-slate-700 leading-snug">
                At <span className="text-orange-600 font-bold">{s.inflation}%</span> inflation, your FD at 7% is actually{' '}
                <span className={`font-bold ${fdRealReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fdRealReturn >= 0 ? '+' : ''}{fdRealReturn.toFixed(2)}%
                </span>{' '}
                real return
              </p>
            </div>
            <div className="px-6 pb-5">
              <div className="flex items-end gap-6 flex-wrap mt-2">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Your Nominal Return</p>
                  <p className="text-5xl font-black text-blue-700 leading-none tabular-nums">{s.nominalReturn}%</p>
                </div>
                <div className="flex gap-6 pb-1">
                  <div>
                    <p className="text-xs text-slate-400">Inflation</p>
                    <p className="text-xl font-bold text-red-500 tabular-nums">{s.inflation}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Real Return</p>
                    <p className={`text-xl font-bold tabular-nums ${realReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {realReturn >= 0 ? '+' : ''}{realReturn.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Key insight banner */}
            <div className={`px-6 py-3 border-t ${fdRealReturn < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
              {fdRealReturn < 0 ? (
                <p className="text-sm font-semibold text-red-700">
                  Your FD is actually LOSING <span className="font-black">{Math.abs(fdRealReturn).toFixed(2)}%</span> purchasing power per year
                </p>
              ) : (
                <p className="text-sm font-semibold text-emerald-700">
                  FD is beating inflation by <span className="font-black">{fdRealReturn.toFixed(2)}%</span> — but barely. Consider higher-return options.
                </p>
              )}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
            <SliderInput label="Nominal Investment Return" hint="FD: 7% | PPF: 7.1% | Equity MF: 12%" value={s.nominalReturn} min={3} max={20} step={0.5} onChange={v => set({ nominalReturn: v })} unit="%" />
            <SliderInput label="Expected Inflation Rate" hint="CPI avg India: 5–6% | Food: 7% | Medical: 8–10%" value={s.inflation} min={3} max={12} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
          </div>

          {/* Instruments comparison table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">How each instrument stacks up</p>
            <p className="text-xs text-slate-400 mb-4">Against {s.inflation}% inflation — green means real gain, red means purchasing power loss</p>
            <div className="space-y-2">
              {INSTRUMENTS.map(inst => {
                const real = calcRealReturn(inst.rate, s.inflation);
                const isPositive = real >= 0;
                return (
                  <div key={inst.label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isPositive ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50'}`}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{inst.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Nominal: {inst.rate}% — Inflation: {s.inflation}%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{real.toFixed(2)}%
                      </p>
                      <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? 'Real gain' : 'Losing power'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your selected investment result */}
          <div className={`rounded-2xl border shadow-sm p-5 ${realReturn >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-slate-500">Your Investment at {s.nominalReturn}%</p>
            <p className={`text-4xl font-black tabular-nums ${realReturn >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {realReturn >= 0 ? '+' : ''}{realReturn.toFixed(2)}% real
            </p>
            <p className={`text-sm mt-2 font-medium ${realReturn >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {realReturn >= 0
                ? `Your purchasing power grows by ${realReturn.toFixed(1)}% per year — you're actually building wealth.`
                : `Inflation is eating your returns. You're losing ${Math.abs(realReturn).toFixed(1)}% purchasing power every year.`}
            </p>
          </div>
        </>
      )}

      {/* ── Next Steps ── */}
      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip',     label: 'Start a SIP',     desc: 'Beat inflation with equity SIP investments' },
        { id: 'goal',    label: 'Plan a Goal',      desc: 'Account for inflation in your goal corpus'  },
        { id: 'compare', label: 'Compare Options',  desc: 'FD vs PPF vs Equity — post-inflation returns' },
      ]} />
    </div>
  );
}
