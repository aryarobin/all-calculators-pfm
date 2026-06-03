import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// ─── SWP core calculations ────────────────────────────────────────────────────

function calcSWP(corpus, monthlyWithdrawal, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  let balance = corpus;
  const data = [];
  let totalWithdrawn = 0;
  let depletedAt = null;

  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) - monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    if (balance <= 0 && !depletedAt) {
      depletedAt = m;
      balance = 0;
    }
    if (m % 12 === 0) {
      data.push({
        year: m / 12,
        balance: Math.max(0, Math.round(balance)),
        withdrawn: Math.round(totalWithdrawn),
      });
    }
  }
  return { data, depletedAt, finalBalance: Math.max(0, balance), totalWithdrawn };
}

function calcMaxSWP(corpus, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  const n = years * 12;
  if (r === 0) return corpus / n;
  return corpus * r / (1 - Math.pow(1 + r, -n));
}

// How many years until depletion for a given monthly amount
function calcDepletionYears(corpus, monthlyWithdrawal, annualReturn) {
  const r = annualReturn / 100 / 12;
  let balance = corpus;
  for (let m = 1; m <= 1200; m++) {
    balance = balance * (1 + r) - monthlyWithdrawal;
    if (balance <= 0) return +(m / 12).toFixed(1);
  }
  return null; // sustainable beyond 100 years
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.stroke }} className="font-semibold">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SWPCalculator({ onNavigate }) {
  const [state, update] = useCalcState('swp', {
    corpus: 10000000,
    monthly: 50000,
    returnRate: 8,
    years: 25,
  });

  const { corpus, monthly, returnRate, years } = state;

  // Core SWP result
  const result = useMemo(
    () => calcSWP(corpus, monthly, returnRate, years),
    [corpus, monthly, returnRate, years],
  );

  // Key derived values
  const perpetualMonthly = useMemo(
    () => Math.round(corpus * returnRate / 100 / 12),
    [corpus, returnRate],
  );

  const balancedMonthly = useMemo(
    () => Math.round(corpus * 0.04 / 12),
    [corpus],
  );

  const aggressiveMonthly = useMemo(
    () => Math.round(calcMaxSWP(corpus, returnRate, years)),
    [corpus, returnRate, years],
  );

  const sustainable = monthly <= aggressiveMonthly;

  const depletionYears = useMemo(() => {
    if (sustainable) return null;
    return calcDepletionYears(corpus, monthly, returnRate);
  }, [corpus, monthly, returnRate, sustainable]);

  // Strategy comparison data
  const strategies = useMemo(() => [
    {
      id: 'conservative',
      label: 'Conservative',
      subtitle: 'Interest only',
      monthly: perpetualMonthly,
      note: 'Corpus never depletes — live forever on returns',
      color: 'emerald',
      result: calcSWP(corpus, perpetualMonthly, returnRate, years),
    },
    {
      id: 'balanced',
      label: 'Balanced',
      subtitle: '4% Safe Withdrawal',
      monthly: balancedMonthly,
      note: 'Global FIRE standard — widely tested across markets',
      color: 'blue',
      result: calcSWP(corpus, balancedMonthly, returnRate, years),
    },
    {
      id: 'aggressive',
      label: 'Aggressive',
      subtitle: `Max for ${years} yrs`,
      monthly: aggressiveMonthly,
      note: `Corpus depletes exactly at year ${years} — nothing left`,
      color: 'orange',
      result: calcSWP(corpus, aggressiveMonthly, returnRate, years),
    },
  ], [corpus, returnRate, years, perpetualMonthly, balancedMonthly, aggressiveMonthly]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Story Header */}
      <div className="text-center">
        <p className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-2">
          SWP — Systematic Withdrawal Plan
        </p>
        <h2 className="text-2xl font-bold text-slate-800 leading-snug">
          Can{' '}
          <span className="text-emerald-700">{formatINR(corpus, true)}</span>
          {' '}sustain{' '}
          <span className="text-emerald-700">{formatINR(monthly)}/mo</span>
          {' '}for{' '}
          <span className="text-emerald-700">{years} years?</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          You've built the wealth. Now make it work as monthly income.
        </p>
      </div>

      {/* Hero Verdict */}
      <div
        className={`rounded-2xl p-6 text-center text-white shadow-xl ${
          sustainable
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-widest opacity-75 mb-2">
          {sustainable ? 'Corpus Verdict' : 'Warning'}
        </p>

        {sustainable ? (
          <>
            <p className="text-5xl font-black tracking-tight">Yes ✓</p>
            <p className="text-lg font-semibold opacity-90 mt-2">
              {formatINR(monthly)}/mo is sustainable for {years}+ years
            </p>
            <p className="text-sm opacity-70 mt-1">
              Final balance after {years} years:{' '}
              <span className="font-black">{formatINR(result.finalBalance)}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl font-black tracking-tight">
              No — depletes in {depletionYears} years
            </p>
            <p className="text-lg font-semibold opacity-90 mt-2">
              {formatINR(monthly)}/mo exceeds what {formatINR(corpus, true)} can sustain
            </p>
            <p className="text-sm opacity-70 mt-1">
              Sustainable max: <span className="font-black">{formatINR(aggressiveMonthly)}/mo</span>
            </p>
          </>
        )}

        {/* Strip */}
        <div className="grid grid-cols-3 gap-3 mt-5 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Total Withdrawn</p>
            <p className="text-lg font-black">{formatINR(result.totalWithdrawn, true)}</p>
          </div>
          <div className="border-l border-r border-white/20">
            <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Monthly Income</p>
            <p className="text-lg font-black">{formatINR(monthly)}/mo</p>
          </div>
          <div>
            <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Return on Corpus</p>
            <p className="text-lg font-black">{returnRate}% p.a.</p>
          </div>
        </div>
      </div>

      {/* Perpetual Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-4">
        <div className="text-3xl mt-0.5">♾️</div>
        <div>
          <p className="text-sm font-bold text-blue-800">Perpetual Withdrawal — Live off interest only</p>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{formatINR(perpetualMonthly)}/mo forever</p>
          <p className="text-xs text-blue-500 mt-1">
            At {returnRate}% return, withdrawing only interest leaves your {formatINR(corpus, true)} corpus intact indefinitely.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Controls */}
        <div className="card space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Parameters</p>

          <SliderInput
            label="Total Retirement Corpus"
            value={corpus}
            min={1000000}
            max={100000000}
            step={500000}
            onChange={v => update({ corpus: v })}
            prefix="₹"
            hint="The total wealth you've built up"
          />

          <SliderInput
            label="Monthly Withdrawal"
            value={monthly}
            min={5000}
            max={500000}
            step={5000}
            onChange={v => update({ monthly: v })}
            prefix="₹"
            hint={`Max sustainable for ${years} yrs: ${formatINR(aggressiveMonthly)}/mo`}
          />

          <SliderInput
            label="Annual Return on Corpus"
            value={returnRate}
            min={4}
            max={14}
            step={0.5}
            onChange={v => update({ returnRate: v })}
            unit="%"
            hint="Conservative: 6% (debt). Moderate: 8%. Aggressive: 10–12%"
          />

          <SliderInput
            label="Withdrawal Period"
            value={years}
            min={5}
            max={50}
            onChange={v => update({ years: v })}
            unit=" yrs"
            hint="How long you need the income to last"
          />
        </div>

        {/* Right: 3 Strategy Comparison */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">3 Withdrawal Strategies</p>

          {strategies.map(s => {
            const isSustainable = s.result.finalBalance > 0;
            const colorMap = {
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', label: 'text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
              blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', label: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' },
              orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' },
            };
            const c = colorMap[s.color];
            return (
              <div key={s.id} className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${c.label}`}>{s.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{s.subtitle}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{formatINR(s.monthly)}<span className="text-sm font-semibold text-slate-400">/mo</span></p>
                    <p className="text-xs text-slate-500 mt-1">{s.note}</p>
                  </div>
                  <button
                    onClick={() => update({ monthly: s.monthly })}
                    className={`flex-shrink-0 text-xs text-white font-bold px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}
                  >
                    Use this
                  </button>
                </div>
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/60 text-xs text-slate-500">
                  <span>
                    Final balance:{' '}
                    <span className={`font-bold ${isSustainable ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isSustainable ? formatINR(s.result.finalBalance, true) : 'Depleted'}
                    </span>
                  </span>
                  <span>
                    Total withdrawn:{' '}
                    <span className="font-bold text-slate-700">{formatINR(s.result.totalWithdrawn, true)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corpus Depletion Chart */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Corpus Depletion Over Time</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {sustainable
                ? `Corpus survives ${years} years — ending at ${formatINR(result.finalBalance, true)}`
                : `Corpus depletes at year ${depletionYears} — reduce monthly withdrawal or earn higher returns`}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              sustainable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {sustainable ? 'Sustainable' : 'Depleting'}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={result.data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0.35} />
                <stop offset="95%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={v => `Yr ${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={v => formatINR(v, true)}
              width={72}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              name="Corpus Balance"
              stroke={sustainable ? '#10b981' : '#ef4444'}
              strokeWidth={2.5}
              fill="url(#corpusGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tax efficiency insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 font-medium leading-relaxed">
        <span className="font-black text-amber-900">Tax tip:</span>{' '}
        SWP from equity mutual funds is more tax-efficient than FD interest.
        FD interest is taxed at your income slab rate, whereas equity SWP gains
        qualify for LTCG with a{' '}
        <span className="font-bold">₹1.25L/year exemption</span>.
        Withdrawing {formatINR(perpetualMonthly)}/mo = {formatINR(perpetualMonthly * 12)}/yr, much of which
        may be principal (not gains).
      </div>

      {/* Next Steps */}
      <NextSteps
        onNavigate={onNavigate}
        steps={[
          {
            id: 'retirement',
            label: 'Retirement Calculator',
            desc: 'Plan how much corpus you need to retire comfortably',
          },
          {
            id: 'retirement-readiness',
            label: 'Retirement Readiness',
            desc: 'Check if you are on track with current savings',
          },
          {
            id: 'goal',
            label: 'Goal Planning',
            desc: 'Set a target corpus and find out the SIP required',
          },
        ]}
      />
    </div>
  );
}
