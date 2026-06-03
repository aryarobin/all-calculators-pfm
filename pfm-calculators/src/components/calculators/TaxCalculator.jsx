import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcIncomeTax, formatINR } from '../../utils/financialCalc';

export default function TaxCalculator() {
  const [income, setIncome] = useState(1200000);
  const [regime, setRegime] = useState('new');
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hra, setHra] = useState(0);
  const [lta, setLta] = useState(0);

  const newRegimeTax = useMemo(() => calcIncomeTax({ grossIncome: income, regime: 'new' }), [income]);
  const oldRegimeTax = useMemo(() => calcIncomeTax({ grossIncome: income, regime: 'old', deductions80C, deductions80D, hra, lta }), [income, deductions80C, deductions80D, hra, lta]);
  const currentTax = regime === 'new' ? newRegimeTax : oldRegimeTax;

  const savings = oldRegimeTax.totalTax - newRegimeTax.totalTax;
  const betterRegime = savings > 0 ? 'new' : 'old';

  const SLAB_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#7c3aed', '#be185d'];

  const slabData = [
    { slab: '0-4L', old: 0, new: 0 },
    { slab: '4-5L', old: 12500, new: 0 },
    { slab: '5-8L', old: 60000, new: 20000 },
    { slab: '8-10L', old: 40000, new: 20000 },
    { slab: '10-12L', old: 60000, new: 40000 },
    { slab: '12-15L', old: 90000, new: 45000 },
    { slab: '>15L', old: 30, new: 30 },
  ];

  const deductionItems = [
    { label: '80C (ELSS/PPF/LIC/EPF)', max: 150000, value: deductions80C, note: 'Max ₹1.5L' },
    { label: '80D (Health Insurance)', max: 25000, value: deductions80D, note: 'Max ₹25K (₹50K senior)' },
    { label: 'HRA Exemption', max: income * 0.4, value: hra, note: 'Based on rent paid' },
    { label: 'LTA', max: 100000, value: lta, note: 'Travel allowance' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Income Tax Calculator</h2>
        <p className="text-slate-500 mt-1">New vs Old regime — find out which saves you more tax! (FY 2024-25)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-lg font-bold text-slate-700 mb-1">💼 What's your annual income?</p>
          <p className="text-sm text-slate-400 mb-4">Total gross salary before any deductions</p>
          <SliderInput label="Annual Gross Income" value={income} min={300000} max={10000000} step={50000} onChange={setIncome} prefix="₹" />

          {/* Regime selector */}
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Which regime to calculate?</p>
            <div className="grid grid-cols-2 gap-3">
              {['new', 'old'].map(r => (
                <button key={r} onClick={() => setRegime(r)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${regime === r ? 'border-orange-400 bg-orange-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <p className={`font-bold ${regime === r ? 'text-orange-700' : 'text-slate-700'}`}>{r === 'new' ? '🆕 New Regime' : '📋 Old Regime'}</p>
                  <p className="text-xs text-slate-400 mt-1">{r === 'new' ? 'Lower rates, no deductions' : 'Higher rates, more deductions'}</p>
                </button>
              ))}
            </div>
          </div>

          {regime === 'old' && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-600 mb-3">📝 Enter your deductions (Old Regime only)</p>
              <SliderInput label="80C Investments" value={deductions80C} min={0} max={150000} step={5000} onChange={setDeductions80C} prefix="₹" hint="ELSS, PPF, LIC, EPF, NSC, etc." />
              <SliderInput label="80D Health Insurance" value={deductions80D} min={0} max={100000} step={5000} onChange={setDeductions80D} prefix="₹" />
              <SliderInput label="HRA Exemption" value={hra} min={0} max={income * 0.5} step={10000} onChange={setHra} prefix="₹" />
              <SliderInput label="LTA" value={lta} min={0} max={200000} step={5000} onChange={setLta} prefix="₹" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Regime comparison */}
          <div className={`card border-0 text-white ${betterRegime === 'new' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">
              {betterRegime === 'new' ? '✅ New Regime Saves More' : '✅ Old Regime Saves More'}
            </p>
            <p className="text-3xl font-black mt-1">Save {formatINR(Math.abs(savings))}</p>
            <p className="text-sm opacity-75 mt-1">by choosing the {betterRegime} regime</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`card p-4 ${regime === 'new' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50'}`}>
              <p className="text-xs font-bold text-emerald-600">New Regime Tax</p>
              <p className="text-xl font-black text-emerald-700">{formatINR(newRegimeTax.totalTax)}</p>
              <p className="text-xs text-emerald-500">Effective: {newRegimeTax.effectiveRate.toFixed(1)}%</p>
            </div>
            <div className={`card p-4 ${regime === 'old' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50'}`}>
              <p className="text-xs font-bold text-blue-600">Old Regime Tax</p>
              <p className="text-xl font-black text-blue-700">{formatINR(oldRegimeTax.totalTax)}</p>
              <p className="text-xs text-blue-500">Effective: {oldRegimeTax.effectiveRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Tax Breakdown ({regime} regime)</p>
            {[
              { label: 'Gross Income', val: formatINR(income) },
              { label: 'Standard Deduction', val: regime === 'new' ? '-₹75,000' : '-₹50,000' },
              { label: 'Other Deductions', val: regime === 'old' ? `-${formatINR(Math.min(deductions80C, 150000) + Math.min(deductions80D, 25000) + hra + lta)}` : '—' },
              { label: 'Taxable Income', val: formatINR(currentTax.taxableIncome), highlight: true },
              { label: 'Income Tax', val: formatINR(currentTax.incomeTax) },
              { label: '4% Health & Education Cess', val: formatINR(currentTax.cess) },
              { label: 'Total Tax Payable', val: formatINR(currentTax.totalTax), highlight: true, danger: true },
              { label: '💰 Take Home (Annual)', val: formatINR(currentTax.takeHome), highlight: true, positive: true },
            ].map(row => (
              <div key={row.label} className={`flex justify-between py-2 border-b border-slate-50 ${row.highlight ? 'font-bold' : ''}`}>
                <span className={`text-sm ${row.positive ? 'text-emerald-600' : row.danger ? 'text-red-600' : 'text-slate-500'}`}>{row.label}</span>
                <span className={`text-sm ${row.positive ? 'text-emerald-700 font-black' : row.danger ? 'text-red-700' : 'text-slate-700'}`}>{row.val}</span>
              </div>
            ))}
          </div>

          <div className="card bg-amber-50 border-amber-100">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">💡 Monthly Take-Home</p>
            <p className="text-3xl font-black text-amber-700">{formatINR(currentTax.takeHome / 12)}/mo</p>
            <p className="text-xs text-amber-500 mt-1">after all taxes and cess</p>
          </div>
        </div>
      </div>

      {/* Bar comparison chart */}
      <div className="card mt-6">
        <h3 className="font-bold text-slate-700 mb-4">New vs Old Regime — Total Tax Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[{ name: 'New Regime', tax: newRegimeTax.totalTax, color: '#10b981' }, { name: 'Old Regime', tax: oldRegimeTax.totalTax, color: '#3b82f6' }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={v => [formatINR(v), 'Total Tax']} />
            <Bar dataKey="tax" radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: v => formatINR(v), fontSize: 12 }}>
              <Cell fill="#10b981" />
              <Cell fill="#3b82f6" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 80C investments reminder */}
      <div className="card mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <p className="font-bold text-emerald-700 mb-3">🛡️ 80C Investments (Old Regime Only) — Save up to ₹46,800 in tax!</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'ELSS (MF)', icon: '📈', note: 'Best returns + tax saving' },
            { label: 'PPF', icon: '🛡️', note: 'Safe, EEE status' },
            { label: 'EPF', icon: '🏛️', note: 'Auto-deducted from salary' },
            { label: 'LIC Premium', icon: '🔒', note: 'Life + tax benefit' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xl">{item.icon}</p>
              <p className="font-bold text-slate-700 text-sm mt-1">{item.label}</p>
              <p className="text-xs text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
