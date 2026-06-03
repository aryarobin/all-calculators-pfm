import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { formatINR } from '../../utils/financialCalc';

const BUDGET_RULES = {
  '50-30-20': { name: '50-30-20 Rule', needs: 50, wants: 30, savings: 20, desc: 'Classic: 50% needs, 30% wants, 20% savings' },
  '60-20-20': { name: '60-20-20 Rule', needs: 60, wants: 20, savings: 20, desc: 'Higher needs: 60% needs, 20% wants, 20% savings' },
  '70-20-10': { name: '70-20-10 Rule', needs: 70, wants: 20, savings: 10, desc: 'Starter: 70% needs, 20% wants, 10% savings' },
  '40-30-30': { name: 'Aggressive Saver', needs: 40, wants: 30, savings: 30, desc: 'FIRE mode: 40% needs, 30% wants, 30% savings' },
};

const EXPENSE_CATEGORIES = {
  needs: [
    { key: 'rent', label: '🏠 Rent / EMI', default: 15000 },
    { key: 'grocery', label: '🛒 Groceries', default: 8000 },
    { key: 'utilities', label: '💡 Utilities', default: 3000 },
    { key: 'transport', label: '🚗 Transport', default: 5000 },
    { key: 'insurance', label: '🛡️ Insurance', default: 3000 },
    { key: 'medical', label: '🏥 Medical', default: 2000 },
  ],
  wants: [
    { key: 'dining', label: '🍕 Dining Out', default: 5000 },
    { key: 'entertainment', label: '🎮 Entertainment', default: 3000 },
    { key: 'shopping', label: '🛍️ Shopping', default: 5000 },
    { key: 'travel', label: '✈️ Travel', default: 3000 },
    { key: 'subscriptions', label: '📱 Subscriptions', default: 1500 },
  ],
  savings: [
    { key: 'sip', label: '📈 SIP / MF', default: 5000 },
    { key: 'ppf', label: '🛡️ PPF / EPF', default: 5000 },
    { key: 'emergency', label: '🔒 Emergency Fund', default: 3000 },
    { key: 'fd', label: '🏦 FD / Savings', default: 2000 },
  ],
};

const COLORS = { needs: '#3b82f6', wants: '#f97316', savings: '#10b981' };

export default function BudgetPlanner() {
  const [income, setIncome] = useState(80000);
  const [rule, setRule] = useState('50-30-20');
  const [mode, setMode] = useState('rule'); // 'rule' | 'custom'
  const [expenses, setExpenses] = useState(() => {
    const e = {};
    Object.values(EXPENSE_CATEGORIES).flat().forEach(item => { e[item.key] = item.default; });
    return e;
  });

  const selectedRule = BUDGET_RULES[rule];
  const ruleAllocation = {
    needs: income * selectedRule.needs / 100,
    wants: income * selectedRule.wants / 100,
    savings: income * selectedRule.savings / 100,
  };

  const customTotals = useMemo(() => ({
    needs: EXPENSE_CATEGORIES.needs.reduce((s, item) => s + (expenses[item.key] || 0), 0),
    wants: EXPENSE_CATEGORIES.wants.reduce((s, item) => s + (expenses[item.key] || 0), 0),
    savings: EXPENSE_CATEGORIES.savings.reduce((s, item) => s + (expenses[item.key] || 0), 0),
  }), [expenses]);

  const totals = mode === 'rule' ? ruleAllocation : customTotals;
  const totalSpend = totals.needs + totals.wants + totals.savings;
  const unallocated = income - totalSpend;

  const pieData = [
    { name: 'Needs', value: Math.round(totals.needs), color: COLORS.needs },
    { name: 'Wants', value: Math.round(totals.wants), color: COLORS.wants },
    { name: 'Savings', value: Math.round(totals.savings), color: COLORS.savings },
    ...(unallocated > 0 ? [{ name: 'Unallocated', value: Math.round(unallocated), color: '#94a3b8' }] : []),
  ];

  const annualSavings = totals.savings * 12;
  const savingsRate = income > 0 ? (totals.savings / income * 100).toFixed(0) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Budget Planner</h2>
        <p className="text-slate-500 mt-1">Plan your money before it plans you — the 50/30/20 rule and beyond</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-lg font-bold text-slate-700 mb-1">💰 What's your monthly take-home?</p>
          <SliderInput label="Monthly Income" value={income} min={15000} max={500000} step={5000} onChange={setIncome} prefix="₹" hint="After-tax in-hand salary" />

          <div className="flex gap-2 mb-4 mt-2">
            {['rule', 'custom'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${mode === m ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500'}`}>
                {m === 'rule' ? '📐 Budget Rule' : '✏️ Custom Budget'}
              </button>
            ))}
          </div>

          {mode === 'rule' ? (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Choose Budget Rule</p>
              {Object.entries(BUDGET_RULES).map(([key, r]) => (
                <button key={key} onClick={() => setRule(key)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${rule === key ? 'border-orange-400 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <p className={`font-bold text-sm ${rule === key ? 'text-orange-700' : 'text-slate-700'}`}>{r.name}</p>
                  <p className="text-xs text-slate-400">{r.desc}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(EXPENSE_CATEGORIES).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm font-bold capitalize`} style={{ color: COLORS[cat] }}>{cat}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: COLORS[cat] + '20', color: COLORS[cat] }}>
                      {formatINR(customTotals[cat])} / {income > 0 ? Math.round(customTotals[cat] / income * 100) : 0}%
                    </span>
                  </div>
                  {items.map(item => (
                    <div key={item.key} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500 w-32 flex-shrink-0">{item.label}</span>
                      <input type="range" min={0} max={50000} step={500} value={expenses[item.key] || 0}
                        onChange={e => setExpenses(prev => ({ ...prev, [item.key]: +e.target.value }))}
                        className="flex-1"
                        style={{ background: `linear-gradient(to right, ${COLORS[cat]} 0%, ${COLORS[cat]} ${Math.min(100, (expenses[item.key] || 0) / 500)}%, #e2e8f0 ${Math.min(100, (expenses[item.key] || 0) / 500)}%, #e2e8f0 100%)` }} />
                      <span className="text-xs font-bold w-16 text-right" style={{ color: COLORS[cat] }}>{formatINR(expenses[item.key] || 0)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center border-blue-200 bg-blue-50">
              <p className="text-xs font-bold text-blue-500 uppercase">Needs</p>
              <p className="text-xl font-black text-blue-700 mt-1">{formatINR(totals.needs)}</p>
              <p className="text-xs text-blue-400">{income > 0 ? Math.round(totals.needs / income * 100) : 0}%</p>
            </div>
            <div className="card p-4 text-center border-orange-200 bg-orange-50">
              <p className="text-xs font-bold text-orange-500 uppercase">Wants</p>
              <p className="text-xl font-black text-orange-700 mt-1">{formatINR(totals.wants)}</p>
              <p className="text-xs text-orange-400">{income > 0 ? Math.round(totals.wants / income * 100) : 0}%</p>
            </div>
            <div className="card p-4 text-center border-emerald-200 bg-emerald-50">
              <p className="text-xs font-bold text-emerald-500 uppercase">Savings</p>
              <p className="text-xl font-black text-emerald-700 mt-1">{formatINR(totals.savings)}</p>
              <p className="text-xs text-emerald-400">{savingsRate}%</p>
            </div>
          </div>

          {unallocated !== 0 && (
            <div className={`card p-4 ${unallocated > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs font-bold ${unallocated > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {unallocated > 0 ? '💚 Unallocated (invest this!)' : '🔴 Overspending!'}
              </p>
              <p className={`text-2xl font-black mt-1 ${unallocated > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatINR(Math.abs(unallocated))}/mo</p>
            </div>
          )}

          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Savings Impact</p>
            <p className="text-sm text-slate-600">Annual savings: <strong className="text-emerald-600">{formatINR(annualSavings)}</strong></p>
            <p className="text-sm text-slate-600">In 10 years (at 12%): <strong className="text-orange-600">{formatINR(annualSavings / 12 > 0 ? (() => { const r = 0.12/12; const n = 120; return (annualSavings/12) * ((Math.pow(1+r,n)-1)/r) * (1+r); })() : 0)}</strong></p>
          </div>

          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Budget Split</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={3} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => formatINR(v)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Health check */}
          <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Budget Health Check</p>
            {[
              { check: savingsRate >= 20, pass: `✅ Savings rate ${savingsRate}% — good!`, fail: `⚠️ Savings rate only ${savingsRate}% — target at least 20%` },
              { check: totals.needs / income <= 0.6, pass: `✅ Needs within 60% of income`, fail: `⚠️ Needs ${Math.round(totals.needs/income*100)}% — try to cut fixed costs` },
              { check: totals.wants / income <= 0.3, pass: `✅ Discretionary spending controlled`, fail: `⚠️ Wants ${Math.round(totals.wants/income*100)}% — scope to cut lifestyle costs` },
            ].map((h, i) => (
              <p key={i} className={`text-sm font-medium mb-1 ${h.check ? 'text-emerald-700' : 'text-amber-800'}`}>
                {h.check ? h.pass : h.fail}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
