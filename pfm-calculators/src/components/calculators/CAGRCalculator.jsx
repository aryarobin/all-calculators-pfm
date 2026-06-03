import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import SliderInput from '../shared/SliderInput';
import {
  calcCAGR,
  calcFutureValue,
  calcMultipleTime,
  formatINR,
  formatPercent,
} from '../../utils/financialCalc';
import { useCalcState } from '../../hooks/useCalcState';

// ─── Constants ───────────────────────────────────────────────────────────────

const BENCHMARKS = [
  { label: 'Bank FD',   rate: 7.0,  risk: 'Low' },
  { label: 'PPF',       rate: 7.1,  risk: 'None' },
  { label: 'Equity MF', rate: 12.0, risk: 'High' },
  { label: 'Nifty 50',  rate: 13.5, risk: 'High' },
];

const COMPARE_RATES = [6, 8, 10, 12, 15];
const COMPARE_YEARS = [5, 10, 15, 20];
const RATE_COLORS = ['#94a3b8', '#60a5fa', '#34d399', '#f59e0b', '#f97316'];

const TABS = [
  { id: 'find-cagr',    label: 'Find CAGR' },
  { id: 'future-value', label: 'Future Value' },
  { id: 'compare-rates', label: 'Compare Rates' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rule72Years(rate) {
  if (!rate || rate <= 0) return null;
  return (72 / rate).toFixed(1);
}

function BenchmarkBar({ rate, maxRate, label }) {
  const pct = Math.min((rate / maxRate) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 shrink-0 text-xs text-slate-500 text-right">{label}</div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-10 text-xs font-semibold text-slate-700 text-right">
        {formatPercent(rate)}
      </div>
    </div>
  );
}

// ─── Mode: Find CAGR ─────────────────────────────────────────────────────────

function FindCAGRMode({ state, update }) {
  const { startValue, endValue, years } = state;

  const cagr = useMemo(
    () => calcCAGR(startValue, endValue, years),
    [startValue, endValue, years],
  );

  const doublingYears = rule72Years(cagr);
  const maxBenchRate = Math.max(...BENCHMARKS.map(b => b.rate), isFinite(cagr) ? cagr : 0);

  const getBenchContext = () => {
    if (!isFinite(cagr) || cagr <= 0) return null;
    const beaten = BENCHMARKS.filter(b => cagr > b.rate);
    if (beaten.length === 0) return 'Below all benchmarks — FD territory';
    if (beaten.length === BENCHMARKS.length) return 'Beats all benchmarks including Nifty 50!';
    return `Beats ${beaten.map(b => b.label).join(', ')}`;
  };

  const ctxMsg = getBenchContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="card space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Tell me the journey
        </p>

        <div className="bg-indigo-50 rounded-xl p-4 mb-5 text-sm text-indigo-700 font-medium leading-relaxed">
          {formatINR(startValue)} grew to{' '}
          <span className="font-bold text-indigo-900">{formatINR(endValue)}</span>
          {' '}in{' '}
          <span className="font-bold text-indigo-900">
            {years} year{years !== 1 ? 's' : ''}
          </span>
          {' '}— what was the CAGR?
        </div>

        <SliderInput
          label="Starting Value"
          value={startValue}
          min={1000}
          max={10000000}
          step={1000}
          onChange={v => update({ startValue: v })}
          prefix="&#8377;"
        />
        <SliderInput
          label="Ending Value"
          value={endValue}
          min={1000}
          max={50000000}
          step={1000}
          onChange={v => update({ endValue: v })}
          prefix="&#8377;"
        />
        <SliderInput
          label="Number of Years"
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={v => update({ years: v })}
          unit=" yrs"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Hero CAGR */}
        <div className="card bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-0">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">
            Compounded Annual Growth Rate
          </p>
          <p className="text-5xl font-black mt-2 tracking-tight">
            {isFinite(cagr) && cagr > 0 ? formatPercent(cagr) : '—'}
          </p>
          <p className="text-sm opacity-75 mt-2">
            {formatINR(startValue)} &rarr; {formatINR(endValue)} over {years} yr{years !== 1 ? 's' : ''}
          </p>
          {ctxMsg && (
            <p className="text-xs mt-2 font-semibold opacity-90">{ctxMsg}</p>
          )}
        </div>

        {/* Rule of 72 */}
        {doublingYears && (
          <div className="card bg-amber-50 border-amber-100">
            <p className="text-xs font-bold text-amber-600 mb-1">Rule of 72</p>
            <p className="text-sm text-amber-800">
              At <strong>{formatPercent(cagr)}</strong> CAGR, money doubles every{' '}
              <strong>{doublingYears} years</strong>
            </p>
          </div>
        )}

        {/* Benchmark comparison */}
        <div className="card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            How does it compare?
          </p>
          <div className="space-y-3">
            {/* Your CAGR bar */}
            {isFinite(cagr) && cagr > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 shrink-0 text-xs font-bold text-indigo-600 text-right">
                  Your CAGR
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min((cagr / maxBenchRate) * 100, 100)}%` }}
                  />
                </div>
                <div className="w-10 text-xs font-bold text-indigo-600 text-right">
                  {formatPercent(cagr)}
                </div>
              </div>
            )}
            <div className="border-t border-dashed border-slate-100 my-1" />
            {BENCHMARKS.map(b => (
              <BenchmarkBar
                key={b.label}
                label={b.label}
                rate={b.rate}
                maxRate={maxBenchRate}
              />
            ))}
          </div>

          {/* Comparison table */}
          <table className="w-full text-xs mt-4">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left py-1 font-semibold">Instrument</th>
                <th className="text-right py-1 font-semibold">Rate</th>
                <th className="text-right py-1 font-semibold">Risk</th>
                <th className="text-right py-1 font-semibold">vs Your CAGR</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map(b => {
                const diff = isFinite(cagr) ? cagr - b.rate : null;
                return (
                  <tr key={b.label} className="border-t border-slate-50">
                    <td className="py-1.5 font-medium text-slate-700">{b.label}</td>
                    <td className="py-1.5 text-right text-slate-600">{formatPercent(b.rate)}</td>
                    <td className="py-1.5 text-right text-slate-400">{b.risk}</td>
                    <td
                      className={`py-1.5 text-right font-semibold ${
                        diff === null
                          ? 'text-slate-300'
                          : diff > 0
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {diff === null
                        ? '—'
                        : (diff > 0 ? '+' : '') + formatPercent(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Mode: Future Value ───────────────────────────────────────────────────────

function FutureValueMode({ state, update }) {
  const { principal, cagr, targetYears } = state;

  const futureVal = useMemo(
    () => calcFutureValue(principal, cagr, targetYears),
    [principal, cagr, targetYears],
  );

  const milestones = useMemo(() => {
    return [
      { label: '2x (Double)', value: 2 },
      { label: '3x (Triple)', value: 3 },
      { label: '5x',          value: 5 },
      { label: '10x',         value: 10 },
    ].map(m => ({
      ...m,
      years: calcMultipleTime(m.value, cagr),
      futureValue: principal * m.value,
    }));
  }, [principal, cagr]);

  const multiple = futureVal / principal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="card space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Your investment plan
        </p>

        <div className="bg-emerald-50 rounded-xl p-4 mb-5 text-sm text-emerald-700 font-medium leading-relaxed">
          {formatINR(principal)} invested at{' '}
          <span className="font-bold text-emerald-900">{formatPercent(cagr)} CAGR</span>
          {' '}for{' '}
          <span className="font-bold text-emerald-900">
            {targetYears} years
          </span>{' '}
          will grow to...
        </div>

        <SliderInput
          label="Principal (one-time investment)"
          value={principal}
          min={1000}
          max={10000000}
          step={1000}
          onChange={v => update({ principal: v })}
          prefix="&#8377;"
        />
        <SliderInput
          label="Expected CAGR"
          value={cagr}
          min={1}
          max={30}
          step={0.5}
          onChange={v => update({ cagr: v })}
          unit="%"
          hint={`Rule of 72: doubles every ~${rule72Years(cagr)} yrs`}
        />
        <SliderInput
          label="Investment Duration"
          value={targetYears}
          min={1}
          max={40}
          step={1}
          onChange={v => update({ targetYears: v })}
          unit=" yrs"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Hero future value */}
        <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">
            Future Value after {targetYears} years
          </p>
          <p className="text-5xl font-black mt-2 tracking-tight">
            {formatINR(futureVal)}
          </p>
          <div className="flex gap-4 mt-3 text-sm opacity-80">
            <span>Invested: {formatINR(principal)}</span>
            <span>Gains: {formatINR(futureVal - principal)}</span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            {multiple.toFixed(2)}x growth at {formatPercent(cagr)} CAGR
          </p>
        </div>

        {/* Milestone table */}
        <div className="card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Growth Milestones at {formatPercent(cagr)} CAGR
          </p>
          <div className="space-y-2">
            {milestones.map(m => {
              const achieved = isFinite(m.years) && m.years <= targetYears;
              const yr = isFinite(m.years) ? m.years.toFixed(1) : null;
              return (
                <div
                  key={m.label}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    achieved
                      ? 'bg-emerald-50 border border-emerald-100'
                      : 'bg-slate-50'
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        achieved ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatINR(m.futureValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    {yr ? (
                      <>
                        <p
                          className={`text-sm font-bold ${
                            achieved ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          Year {yr}
                        </p>
                        <p className="text-xs text-slate-400">
                          {achieved
                            ? 'within your window'
                            : `needs ${(m.years - targetYears).toFixed(1)} more yrs`}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-300">n/a</p>
                    )}
                  </div>
                  {achieved && (
                    <div className="ml-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      &#10003;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mode: Compare Rates ──────────────────────────────────────────────────────

function RatesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-bold text-slate-700 mb-2">{label} years</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-semibold text-slate-800">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CompareRatesMode({ state, update }) {
  const { principal } = state;

  const chartData = useMemo(
    () =>
      COMPARE_YEARS.map(yr => {
        const row = { year: yr };
        COMPARE_RATES.forEach(r => {
          row[`${r}%`] = Math.round(calcFutureValue(principal, r, yr));
        });
        return row;
      }),
    [principal],
  );

  const tableData = useMemo(
    () =>
      COMPARE_RATES.map(r => ({
        rate: r,
        values: COMPARE_YEARS.map(yr =>
          Math.round(calcFutureValue(principal, r, yr)),
        ),
      })),
    [principal],
  );

  return (
    <div className="space-y-6">
      {/* Principal input */}
      <div className="card">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Your starting principal
        </p>
        <SliderInput
          label="Principal Amount"
          value={principal}
          min={1000}
          max={10000000}
          step={1000}
          onChange={v => update({ principal: v })}
          prefix="&#8377;"
        />
      </div>

      {/* Bar chart */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-1">
          Corpus comparison — {formatINR(principal)} across 5 return rates
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Each group shows corpus at 5, 10, 15, 20 years for different CAGR rates
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            barCategoryGap="20%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tickFormatter={v => `${v} yrs`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={v => formatINR(v, true)}
              width={72}
            />
            <Tooltip content={<RatesTooltip />} />
            <Legend />
            {COMPARE_RATES.map((r, i) => (
              <Bar
                key={r}
                dataKey={`${r}%`}
                name={`${r}% CAGR`}
                fill={RATE_COLORS[i]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      <div className="card overflow-x-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Corpus at each milestone ({formatINR(principal)} invested)
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs">
              <th className="text-left py-2 font-semibold pr-4">Rate</th>
              {COMPARE_YEARS.map(yr => (
                <th key={yr} className="text-right py-2 font-semibold px-2">
                  {yr} yrs
                </th>
              ))}
              <th className="text-right py-2 font-semibold px-2">20yr gain</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => {
              const gain20 = row.values[3] - principal;
              return (
                <tr
                  key={row.rate}
                  className="border-t border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2 pr-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: RATE_COLORS[i] }}
                    >
                      {row.rate}% CAGR
                    </span>
                  </td>
                  {row.values.map((val, j) => (
                    <td
                      key={j}
                      className="py-2 text-right font-semibold text-slate-700 px-2 text-xs"
                    >
                      {formatINR(val)}
                    </td>
                  ))}
                  <td className="py-2 text-right font-bold text-emerald-600 px-2 text-xs">
                    +{formatINR(gain20)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-slate-400 mt-3">
          Note: All values are pre-tax. Actual returns may vary. Past performance does not guarantee future returns.
        </p>
      </div>
    </div>
  );
}

// ─── Next Steps ───────────────────────────────────────────────────────────────

function NextSteps({ onNavigate }) {
  const links = [
    {
      id: 'multiplier',
      label: 'Money Multiplier',
      desc: 'When will your money 2x, 5x, 10x?',
      color: 'bg-orange-50 border-orange-100 text-orange-700',
    },
    {
      id: 'compare',
      label: 'Compare Investments',
      desc: 'FD vs PPF vs MF — full comparison',
      color: 'bg-blue-50 border-blue-100 text-blue-700',
    },
    {
      id: 'sip',
      label: 'SIP Calculator',
      desc: 'Plan monthly SIPs to hit your goal',
      color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    },
  ];

  if (!onNavigate) return null;

  return (
    <div className="card mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Explore next
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => onNavigate(l.id)}
            className={`text-left p-3 rounded-xl border transition-all hover:shadow-sm ${l.color}`}
          >
            <p className="text-sm font-bold">{l.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{l.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CAGRCalculator({ onNavigate }) {
  const [state, update] = useCalcState('cagr', {
    mode: 'find-cagr',
    startValue: 100000,
    endValue: 500000,
    years: 10,
    principal: 100000,
    cagr: 12,
    targetYears: 15,
  });

  const { mode } = state;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">CAGR Calculator</h2>
        <p className="text-slate-500 mt-1">
          Compounded Annual Growth Rate — the real measure of investment performance
        </p>
      </div>

      {/* Mode tabs — clean toggle pills */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => update({ mode: tab.id })}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === tab.id
                ? 'bg-white shadow text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode content */}
      {mode === 'find-cagr' && (
        <FindCAGRMode state={state} update={update} />
      )}
      {mode === 'future-value' && (
        <FutureValueMode state={state} update={update} />
      )}
      {mode === 'compare-rates' && (
        <CompareRatesMode state={state} update={update} />
      )}

      {/* Next steps */}
      <NextSteps onNavigate={onNavigate} />
    </div>
  );
}
