import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import {
  calcMultipleTime,
  calcRateForMultiple,
  ruleOf72,
  formatINR,
} from '../../utils/financialCalc';

// ─── Milestone definitions ────────────────────────────────────────────────────

const MILESTONES = [
  { label: '2x',   value: 2,   color: '#3b82f6' },
  { label: '3x',   value: 3,   color: '#10b981' },
  { label: '5x',   value: 5,   color: '#f59e0b' },
  { label: '10x',  value: 10,  color: '#f97316' },
  { label: '20x',  value: 20,  color: '#7c3aed' },
  { label: '100x', value: 100, color: '#ef4444' },
];

const NEXT_STEPS = [
  { id: 'cagr',    label: 'CAGR Calculator',         desc: 'Calculate the actual CAGR of your investments' },
  { id: 'sip',     label: 'SIP Calculator',           desc: 'Grow wealth faster with monthly contributions' },
  { id: 'compare', label: 'Investment Comparison',    desc: 'Compare FD, MF, PPF and more side by side' },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-600 mb-1">Year {label}</p>
      <p className="text-violet-600 font-bold">{formatINR(payload[0]?.value)}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoneyMultiplier({ onNavigate }) {
  const [state, update] = useCalcState('multiplier', {
    amount: 100000,
    rate: 12,
    targetMultiple: 10,
    yearsTarget: 10,
    mode: 'time',
  });

  const { amount, rate, targetMultiple, yearsTarget, mode } = state;
  const isTimeMode = mode === 'time';

  // ── Core calculations ───────────────────────────────────────────────────────
  const timeToTarget  = useMemo(() => calcMultipleTime(targetMultiple, rate), [targetMultiple, rate]);
  const rateNeeded    = useMemo(() => calcRateForMultiple(targetMultiple, yearsTarget), [targetMultiple, yearsTarget]);
  const rule72Years   = useMemo(() => ruleOf72(rate), [rate]);

  // ── Milestone grid ──────────────────────────────────────────────────────────
  const milestones = useMemo(() =>
    MILESTONES.map(m => ({
      ...m,
      yearsAtRate:  calcMultipleTime(m.value, rate),
      rateNeeded:   calcRateForMultiple(m.value, yearsTarget),
      futureValue:  amount * m.value,
    })),
    [rate, yearsTarget, amount]
  );

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const effectiveRate = isTimeMode ? rate : rateNeeded;
    const horizon = isTimeMode
      ? Math.min(60, Math.max(30, Math.ceil(timeToTarget * 1.3 + 3)))
      : Math.min(60, Math.max(yearsTarget + 5, 20));
    return Array.from({ length: horizon }, (_, i) => {
      const yr = i + 1;
      return {
        year: yr,
        value: Math.round(amount * Math.pow(1 + effectiveRate / 100, yr)),
      };
    });
  }, [amount, rate, rateNeeded, timeToTarget, yearsTarget, isTimeMode]);

  // ── Story header ────────────────────────────────────────────────────────────
  const storyText = isTimeMode
    ? `At ${rate}% CAGR, ${formatINR(amount)} takes ${isFinite(timeToTarget) ? `${timeToTarget.toFixed(1)} yrs` : 'forever'} to become ${formatINR(amount * targetMultiple)}`
    : `To turn ${formatINR(amount)} into ${formatINR(amount * targetMultiple)} in ${yearsTarget} yrs you need ${rateNeeded.toFixed(1)}% CAGR`;

  // ── Hero value ──────────────────────────────────────────────────────────────
  const heroValue = isTimeMode
    ? (isFinite(timeToTarget) ? `${timeToTarget.toFixed(1)} yrs` : '∞')
    : `${rateNeeded.toFixed(1)}%`;

  const heroLabel = isTimeMode
    ? `Time to ${targetMultiple}x your money`
    : `CAGR needed for ${targetMultiple}x in ${yearsTarget} yrs`;

  const heroSub = isTimeMode
    ? `${formatINR(amount)} grows to ${formatINR(amount * targetMultiple)}`
    : `${formatINR(amount)} → ${formatINR(amount * targetMultiple)}`;

  const heroBg = isTimeMode
    ? 'bg-gradient-to-br from-orange-500 to-amber-500'
    : 'bg-gradient-to-br from-violet-600 to-purple-700';

  const refLineValue  = amount * targetMultiple;
  const refLineYear   = isTimeMode && isFinite(timeToTarget) ? Math.round(timeToTarget) : yearsTarget;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Money Multiplier</h2>
        <p className="text-slate-500 mt-1 text-sm leading-snug max-w-xl mx-auto">{storyText}</p>
      </div>

      {/* ── Mode toggle ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl flex-wrap justify-center mx-auto">
        {[
          ['time', 'Time to Multiply'],
          ['rate', 'Rate Needed'],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => update({ mode: m })}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m
                ? 'bg-white shadow text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inputs */}
        <div className="card space-y-1">
          <SliderInput
            label="Starting Amount"
            value={amount}
            min={10000}
            max={10000000}
            step={10000}
            onChange={v => update({ amount: v })}
            prefix="₹"
          />

          {isTimeMode && (
            <SliderInput
              label="Expected CAGR"
              value={rate}
              min={4}
              max={30}
              step={0.5}
              onChange={v => update({ rate: v })}
              unit="%"
              hint={`Rule of 72: money doubles in ~${rule72Years.toFixed(1)} yrs at this rate`}
            />
          )}

          {!isTimeMode && (
            <SliderInput
              label="Time Available"
              value={yearsTarget}
              min={1}
              max={40}
              step={1}
              onChange={v => update({ yearsTarget: v })}
              unit=" yrs"
            />
          )}

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Target Multiple</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {MILESTONES.map(m => (
                <button
                  key={m.value}
                  onClick={() => update({ targetMultiple: m.value })}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                    targetMultiple === m.value
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <SliderInput
              label="Custom Multiple"
              value={targetMultiple}
              min={2}
              max={100}
              step={1}
              onChange={v => update({ targetMultiple: v })}
              unit="x"
            />
          </div>
        </div>

        {/* Results column */}
        <div className="space-y-4">

          {/* Hero card */}
          <div className={`card ${heroBg} text-white border-0`}>
            <p className="text-xs font-semibold opacity-75 uppercase tracking-widest mb-1">{heroLabel}</p>
            <p className="text-3xl sm:text-5xl font-black leading-none mt-2 mb-2">{heroValue}</p>
            <p className="text-sm opacity-80">{heroSub}</p>
          </div>

          {/* Rule of 72 callout — always visible */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Rule of 72</p>
            <p className="text-sm text-amber-800">
              Divide 72 by your return rate to estimate doubling time.{' '}
              At <strong>{rate}%</strong> CAGR, money doubles in roughly{' '}
              <strong>{rule72Years.toFixed(1)} years</strong>.
              {isTimeMode && rateNeeded > 0 &&
                ` (For ${targetMultiple}x you need ${Math.log2(targetMultiple).toFixed(1)} doublings.)`
              }
            </p>
          </div>

          {/* Milestone grid */}
          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {isTimeMode
                ? `All milestones at ${rate}% CAGR`
                : `Rate needed in ${yearsTarget} yrs`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {milestones.map(m => {
                const isActive = m.value === targetMultiple;
                const stat = isTimeMode
                  ? `${isFinite(m.yearsAtRate) ? m.yearsAtRate.toFixed(1) : '∞'} yrs`
                  : `${m.rateNeeded.toFixed(1)}% CAGR`;
                return (
                  <button
                    key={m.value}
                    onClick={() => update({ targetMultiple: m.value })}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'ring-2 ring-blue-400 bg-blue-50'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                      style={{ background: m.color }}
                    >
                      {m.label}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{formatINR(m.futureValue)}</p>
                      <p className="text-[11px] text-slate-400">{stat}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Growth trajectory chart ─────────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-4 text-sm">
          Growth Trajectory — {targetMultiple}x target at{' '}
          {isTimeMode ? `${rate}%` : `${rateNeeded.toFixed(1)}%`} CAGR
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              tickFormatter={v => `Yr ${v}`}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={v => formatINR(v, true)}
              width={72}
            />
            <Tooltip content={<ChartTooltip />} />
            {/* Target value reference */}
            <ReferenceLine
              y={refLineValue}
              stroke="#f97316"
              strokeDasharray="5 5"
              label={{ value: `${targetMultiple}x`, position: 'right', fill: '#f97316', fontSize: 11 }}
            />
            {/* Target year reference */}
            {isTimeMode && isFinite(timeToTarget) && refLineYear <= chartData.length && (
              <ReferenceLine
                x={refLineYear}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `${timeToTarget.toFixed(1)} yr`, position: 'top', fill: '#10b981', fontSize: 11 }}
              />
            )}
            {!isTimeMode && yearsTarget <= chartData.length && (
              <ReferenceLine
                x={yearsTarget}
                stroke="#7c3aed"
                strokeDasharray="4 4"
                label={{ value: `${yearsTarget} yr`, position: 'top', fill: '#7c3aed', fontSize: 11 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={false}
              name="Value"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Next steps ──────────────────────────────────────────────────────── */}
      <NextSteps steps={NEXT_STEPS} onNavigate={onNavigate} />
    </div>
  );
}
