import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const BUDGET_RULES = {
  '50-30-20': { name: '50-30-20 Rule', needs: 50, wants: 30, savings: 20, desc: 'Classic — needs 50%, wants 30%, savings 20%' },
  '60-20-20': { name: '60-20-20 Rule', needs: 60, wants: 20, savings: 20, desc: 'Higher needs — 60% needs, 20% wants, 20% savings' },
  '70-20-10': { name: '70-20-10 Rule', needs: 70, wants: 20, savings: 10, desc: 'Starter — 70% needs, 20% wants, 10% savings' },
  '40-30-30': { name: 'Aggressive Saver', needs: 40, wants: 30, savings: 30, desc: 'FIRE mode — 40% needs, 30% wants, 30% savings' },
};

const COLORS = { needs: '#3b82f6', wants: '#f97316', savings: '#10b981' };

function getSavingsHealth(rate) {
  const r = Number(rate);
  if (r >= 30) return { score: 95, label: 'Excellent', color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', msg: "You're in FIRE territory. Keep investing every rupee saved." };
  if (r >= 20) return { score: 75, label: 'Good', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500', msg: "Solid savings rate. Consider increasing SIP by ₹500/mo each year." };
  if (r >= 10) return { score: 45, label: 'Okay', color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-400', msg: "You're saving, but there's room to grow. Cut one want to boost savings." };
  return { score: 15, label: 'Poor', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', msg: "Less than 10% savings is risky. Try automating savings on payday." };
}

function calcCorpus(monthlyAmt, years, rate) {
  if (monthlyAmt <= 0) return 0;
  const r = rate / 12 / 100;
  const n = years * 12;
  return monthlyAmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700">{payload[0].name}</p>
      <p className="font-semibold" style={{ color: payload[0].payload.color }}>{formatINR(payload[0].value)}</p>
    </div>
  );
};

export default function BudgetPlanner({ onNavigate }) {
  const [s, set] = useCalcState('budget', {
    income: 80000,
    rule: '50-30-20',
    needs: 40000,
    wants: 24000,
    savings: 16000,
    mode: 'rule',
  });

  const selectedRule = BUDGET_RULES[s.rule];

  const totals = useMemo(() => {
    if (s.mode === 'rule') {
      return {
        needs: Math.round(s.income * selectedRule.needs / 100),
        wants: Math.round(s.income * selectedRule.wants / 100),
        savings: Math.round(s.income * selectedRule.savings / 100),
      };
    }
    return { needs: s.needs, wants: s.wants, savings: s.savings };
  }, [s, selectedRule]);

  const savingsRate = s.income > 0 ? (totals.savings / s.income * 100).toFixed(0) : 0;
  const health = getSavingsHealth(savingsRate);
  const corpus10 = calcCorpus(totals.savings, 10, 12);
  const annualSavings = totals.savings * 12;
  const totalAllocated = totals.needs + totals.wants + totals.savings;
  const unallocated = s.income - totalAllocated;

  const pieData = [
    { name: 'Needs', value: totals.needs, color: COLORS.needs },
    { name: 'Wants', value: totals.wants, color: COLORS.wants },
    { name: 'Savings', value: totals.savings, color: COLORS.savings },
    ...(unallocated > 0 ? [{ name: 'Unallocated', value: unallocated, color: '#94a3b8' }] : []),
  ].filter(d => d.value > 0);

  const handleRuleChange = (ruleKey) => {
    const r = BUDGET_RULES[ruleKey];
    set({
      rule: ruleKey,
      needs: Math.round(s.income * r.needs / 100),
      wants: Math.round(s.income * r.wants / 100),
      savings: Math.round(s.income * r.savings / 100),
    });
  };

  const handleIncomeChange = (val) => {
    if (s.mode === 'rule') {
      const r = BUDGET_RULES[s.rule];
      set({
        income: val,
        needs: Math.round(val * r.needs / 100),
        wants: Math.round(val * r.wants / 100),
        savings: Math.round(val * r.savings / 100),
      });
    } else {
      set({ income: val });
    }
  };

  const switchMode = (mode) => {
    if (mode === 'rule') {
      const r = BUDGET_RULES[s.rule];
      set({
        mode,
        needs: Math.round(s.income * r.needs / 100),
        wants: Math.round(s.income * r.wants / 100),
        savings: Math.round(s.income * r.savings / 100),
      });
    } else {
      set({ mode });
    }
  };

  return (
    <div className="space-y-4">
      {/* Story + Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Budget Planner</p>
          <p className="text-lg font-semibold text-slate-700 leading-snug">
            On <span className="text-blue-700 font-bold">{formatINR(s.income)}</span> income, you should save{' '}
            <span className="text-emerald-600 font-bold">{formatINR(totals.savings)}/month</span> — are you?
          </p>
        </div>
        <div className="px-6 pb-5 flex items-end gap-6 flex-wrap mt-2">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Monthly Savings</p>
            <p className="text-5xl font-black text-emerald-600 leading-none tabular-nums">{formatINR(totals.savings)}</p>
          </div>
          <div className="flex gap-4 pb-1">
            <div>
              <p className="text-xs text-slate-400">Needs</p>
              <p className="text-xl font-bold text-blue-600 tabular-nums">{formatINR(totals.needs)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Wants</p>
              <p className="text-xl font-bold text-orange-500 tabular-nums">{formatINR(totals.wants)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {/* Income */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <SliderInput
              label="Monthly Income (take-home)"
              value={s.income}
              min={15000}
              max={500000}
              step={5000}
              onChange={handleIncomeChange}
              prefix="₹"
              hint="After-tax in-hand salary"
            />

            {/* Mode toggle */}
            <div className="flex gap-2 mt-2">
              {[
                { id: 'rule', label: 'Use a Rule' },
                { id: 'custom', label: 'Track My Spending' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    s.mode === m.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rule selection */}
          {s.mode === 'rule' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Budget Rule</p>
              <div className="space-y-2">
                {Object.entries(BUDGET_RULES).map(([key, r]) => (
                  <button
                    key={key}
                    onClick={() => handleRuleChange(key)}
                    className={`w-full p-3.5 rounded-xl border-2 text-left transition-all ${
                      s.rule === key
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-sm ${s.rule === key ? 'text-blue-700' : 'text-slate-700'}`}>
                        {r.name}
                      </p>
                      {s.rule === key && (
                        <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom sliders */}
          {s.mode === 'custom' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Monthly Spending</p>
              <SliderInput
                label="Needs (rent, groceries, utilities)"
                value={s.needs}
                min={0}
                max={s.income}
                step={1000}
                onChange={val => set({ needs: val })}
                prefix="₹"
                hint="Essential fixed expenses"
              />
              <SliderInput
                label="Wants (dining, shopping, travel)"
                value={s.wants}
                min={0}
                max={s.income}
                step={500}
                onChange={val => set({ wants: val })}
                prefix="₹"
                hint="Lifestyle and discretionary"
              />
              <SliderInput
                label="Savings (SIP, PPF, FD)"
                value={s.savings}
                min={0}
                max={s.income}
                step={500}
                onChange={val => set({ savings: val })}
                prefix="₹"
                hint="Investments and emergency fund"
              />
              {unallocated !== 0 && (
                <div className={`mt-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                  unallocated > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  {unallocated > 0
                    ? `${formatINR(unallocated)} unallocated — move this to savings!`
                    : `${formatINR(Math.abs(unallocated))} over your income — reduce spending`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* Savings Health Score */}
          <div className={`bg-white rounded-2xl border ${health.border} shadow-sm p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savings Health Score</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${health.bg} ${health.text}`}>
                {health.label}
              </span>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <p className={`text-5xl font-black leading-none tabular-nums ${health.text}`}>{health.score}</p>
              <p className="text-slate-400 text-sm pb-1">/ 100</p>
              <p className={`text-2xl font-bold pb-0.5 tabular-nums ${health.text}`}>{savingsRate}% saved</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${health.bar}`}
                style={{ width: `${health.score}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">{health.msg}</p>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Budget Split</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={9} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 10-year projection */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-sm p-5 text-white">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Corpus in 10 Years</p>
            <p className="text-xs text-slate-400 mb-3">If you invest your savings at 12% p.a.</p>
            <p className="text-4xl font-black text-emerald-400 leading-none tabular-nums mb-2">
              {formatINR(corpus10)}
            </p>
            <div className="flex gap-6 mt-3">
              <div>
                <p className="text-xs text-slate-400">Amount Invested</p>
                <p className="text-base font-bold text-slate-200 tabular-nums">{formatINR(annualSavings * 10)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Gains</p>
                <p className="text-base font-bold text-emerald-400 tabular-nums">
                  {formatINR(Math.max(0, corpus10 - annualSavings * 10))}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Multiple</p>
                <p className="text-base font-bold text-blue-300 tabular-nums">
                  {annualSavings > 0 ? (corpus10 / (annualSavings * 10)).toFixed(1) : '—'}x
                </p>
              </div>
            </div>
          </div>

          {/* Budget health checks */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Budget Health Check</p>
            <div className="space-y-2">
              {[
                {
                  check: Number(savingsRate) >= 20,
                  pass: `Savings rate ${savingsRate}% — solid`,
                  fail: `Savings rate only ${savingsRate}% — target at least 20%`,
                  passColor: 'text-emerald-700 bg-emerald-50',
                  failColor: 'text-amber-700 bg-amber-50',
                },
                {
                  check: s.income > 0 && totals.needs / s.income <= 0.6,
                  pass: `Needs within 60% of income`,
                  fail: `Needs at ${s.income > 0 ? Math.round(totals.needs / s.income * 100) : 0}% — try to reduce fixed costs`,
                  passColor: 'text-emerald-700 bg-emerald-50',
                  failColor: 'text-red-700 bg-red-50',
                },
                {
                  check: s.income > 0 && totals.wants / s.income <= 0.3,
                  pass: `Discretionary spending controlled`,
                  fail: `Wants at ${s.income > 0 ? Math.round(totals.wants / s.income * 100) : 0}% — scope to cut lifestyle costs`,
                  passColor: 'text-emerald-700 bg-emerald-50',
                  failColor: 'text-amber-700 bg-amber-50',
                },
              ].map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${h.check ? h.passColor : h.failColor}`}
                >
                  <span>{h.check ? '✓' : '!'}</span>
                  <span>{h.check ? h.pass : h.fail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <NextSteps
        onNavigate={onNavigate}
        steps={[
          { id: 'sip', label: 'Start a SIP', desc: 'Invest your monthly savings in mutual funds' },
          { id: 'goal', label: 'Set a Goal', desc: 'Plan for a house, car, or education fund' },
          { id: 'tax', label: 'Save on Tax', desc: 'Use 80C deductions to keep more money' },
        ]}
      />
    </div>
  );
}
