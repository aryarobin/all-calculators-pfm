import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { calcIncomeTax, formatINR, TAX_SLABS_NEW, TAX_SLABS_OLD } from '../../utils/financialCalc';
import { useCalcState } from '../../hooks/useCalcState';

// Slab breakdown for the selected regime
function getSlabBreakdown(taxableIncome, slabs) {
  return slabs
    .filter(s => s.rate > 0 || taxableIncome > s.from)
    .map(slab => {
      const slabable = Math.max(0, Math.min(taxableIncome, slab.to === Infinity ? taxableIncome : slab.to) - slab.from);
      const tax = slabable * slab.rate / 100;
      const label = slab.to === Infinity
        ? `Above ${formatINR(slab.from, true)}`
        : `${formatINR(slab.from, true)} – ${formatINR(slab.to, true)}`;
      return { label, rate: slab.rate, slabable, tax };
    })
    .filter(r => r.slabable > 0);
}

const NEXT_STEPS = [
  { id: 'salary', label: 'Salary Calculator', desc: 'Break down your CTC into in-hand salary' },
  { id: 'budget', label: 'Budget Planner', desc: 'Plan how to use your take-home wisely' },
  { id: 'goal', label: 'Goal Planning', desc: 'Put your tax savings to work' },
];

export default function TaxCalculator({ onNavigate }) {
  const [state, update] = useCalcState('tax', {
    income: 1200000,
    regime: 'new',
    d80C: 150000,
    d80D: 25000,
    hra: 0,
  });

  const { income, regime, d80C, d80D, hra } = state;

  const newTax = useMemo(
    () => calcIncomeTax({ grossIncome: income, regime: 'new' }),
    [income]
  );
  const oldTax = useMemo(
    () => calcIncomeTax({ grossIncome: income, regime: 'old', deductions80C: d80C, deductions80D: d80D, hra }),
    [income, d80C, d80D, hra]
  );

  const currentTax = regime === 'new' ? newTax : oldTax;
  const savings = oldTax.totalTax - newTax.totalTax; // positive = new saves more
  const betterRegime = savings >= 0 ? 'new' : 'old';
  const savedAmount = Math.abs(savings);

  const monthlyTakeHome = currentTax.takeHome / 12;

  // Tax Freedom Day: months you work for the government
  const taxMonths = income > 0 ? (currentTax.totalTax / income) * 12 : 0;
  const taxFreedomMonth = Math.round(taxMonths * 10) / 10;

  // Slab breakdown
  const currentSlabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;
  const slabBreakdown = useMemo(
    () => getSlabBreakdown(currentTax.taxableIncome, currentSlabs),
    [currentTax.taxableIncome, currentSlabs]
  );

  const barData = [
    { name: 'New Regime', tax: Math.round(newTax.totalTax) },
    { name: 'Old Regime', tax: Math.round(oldTax.totalTax) },
  ];

  // What you can do with saved tax
  const sipEquiv = Math.round(savedAmount / 12);
  const vacations = Math.floor(savedAmount / 80000);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Income Tax Calculator</h2>
        <p className="text-slate-500 mt-1">
          New vs Old Regime — find out which saves you more &nbsp;(FY 2025-26)
        </p>
      </div>

      {/* Story Banner */}
      <div className={`rounded-2xl px-6 py-4 border-0 text-white ${betterRegime === 'new' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
        <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-0.5">
          On {formatINR(income, true)} salary
        </p>
        <p className="text-xl font-black">
          {betterRegime === 'new' ? 'New Regime' : 'Old Regime'} saves you{' '}
          <span className="text-yellow-200">{formatINR(savedAmount)}</span> vs the other regime
        </p>
        <p className="text-sm opacity-75 mt-1">
          Effective tax rate: {currentTax.effectiveRate.toFixed(1)}% &nbsp;|&nbsp;
          Taxable income: {formatINR(currentTax.taxableIncome, true)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="card space-y-2">
          <p className="text-lg font-bold text-slate-700 mb-0">Annual Gross Income</p>
          <p className="text-xs text-slate-400 mb-3">Total salary before any deductions</p>
          <SliderInput
            label="Annual Gross Income"
            value={income}
            min={300000}
            max={10000000}
            step={50000}
            onChange={v => update({ income: v })}
            prefix="₹"
          />

          {/* Regime Toggle */}
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2 mb-2">
            Choose Regime
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['new', 'old'].map(r => (
              <button
                key={r}
                onClick={() => update({ regime: r })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  regime === r
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <p className={`font-bold text-sm ${regime === r ? 'text-orange-700' : 'text-slate-700'}`}>
                  {r === 'new' ? 'New Regime' : 'Old Regime'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {r === 'new' ? 'Lower rates, no deductions' : 'More deductions, higher rates'}
                </p>
                <p className={`text-base font-black mt-1 ${regime === r ? 'text-orange-600' : 'text-slate-600'}`}>
                  {formatINR(r === 'new' ? newTax.totalTax : oldTax.totalTax)}
                </p>
                <p className="text-xs text-slate-400">total tax</p>
              </button>
            ))}
          </div>

          {/* Old Regime Deductions */}
          {regime === 'old' && (
            <div className="mt-4 space-y-1">
              <p className="text-sm font-bold text-slate-600 mb-2">Old Regime Deductions</p>
              <SliderInput
                label="80C (ELSS / PPF / EPF / LIC)"
                value={d80C}
                min={0}
                max={150000}
                step={5000}
                onChange={v => update({ d80C: v })}
                prefix="₹"
                hint="Max ₹1.5 L"
              />
              <SliderInput
                label="80D (Health Insurance)"
                value={d80D}
                min={0}
                max={100000}
                step={5000}
                onChange={v => update({ d80D: v })}
                prefix="₹"
                hint="Self ₹25K, Parents ₹25K extra"
              />
              <SliderInput
                label="HRA Exemption"
                value={hra}
                min={0}
                max={Math.round(income * 0.5)}
                step={10000}
                onChange={v => update({ hra: v })}
                prefix="₹"
                hint="Based on rent paid & city"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Hero + insights */}
        <div className="space-y-4">
          {/* Hero: Monthly take-home */}
          <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Take-Home
            </p>
            <p className="text-5xl font-black mt-1 text-white">
              {formatINR(monthlyTakeHome)}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              per month &nbsp;|&nbsp; Annual: {formatINR(currentTax.takeHome, true)}
            </p>
          </div>

          {/* Tax Freedom Day */}
          <div className="card bg-amber-50 border-amber-200">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              Tax Freedom Day
            </p>
            <p className="text-2xl font-black text-amber-700">
              {taxFreedomMonth.toFixed(1)} months/year
            </p>
            <p className="text-sm text-amber-600 mt-1">
              You work{' '}
              <strong>{taxFreedomMonth.toFixed(1)} months</strong> every year just for the
              government. Your money starts from{' '}
              <strong>
                {new Date(2025, Math.round(taxFreedomMonth), 1).toLocaleString('en-IN', {
                  month: 'long',
                })}
              </strong>.
            </p>
          </div>

          {/* Tax breakdown table */}
          <div className="card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Breakdown — {regime === 'new' ? 'New' : 'Old'} Regime
            </p>
            {[
              { label: 'Gross Income', val: formatINR(income) },
              {
                label: 'Standard Deduction',
                val: regime === 'new' ? '−₹75,000' : '−₹50,000',
              },
              regime === 'old'
                ? {
                    label: 'Other Deductions (80C/80D/HRA)',
                    val: `−${formatINR(
                      Math.min(d80C, 150000) + Math.min(d80D, 25000) + hra
                    )}`,
                  }
                : null,
              { label: 'Taxable Income', val: formatINR(currentTax.taxableIncome), bold: true },
              { label: 'Income Tax', val: formatINR(currentTax.incomeTax) },
              { label: '4% Cess', val: formatINR(currentTax.cess) },
              { label: 'Total Tax', val: formatINR(currentTax.totalTax), danger: true, bold: true },
              { label: 'Annual Take-Home', val: formatINR(currentTax.takeHome), positive: true, bold: true },
            ]
              .filter(Boolean)
              .map(row => (
                <div
                  key={row.label}
                  className={`flex justify-between py-2 border-b border-slate-50 last:border-0 ${row.bold ? 'font-bold' : ''}`}
                >
                  <span
                    className={`text-sm ${
                      row.positive
                        ? 'text-emerald-600'
                        : row.danger
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`text-sm ${
                      row.positive
                        ? 'text-emerald-700 font-black'
                        : row.danger
                        ? 'text-red-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bar Chart: New vs Old */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-1">New vs Old Regime — Total Tax</h3>
        <p className="text-xs text-slate-400 mb-4">
          {betterRegime === 'new' ? 'New' : 'Old'} regime saves{' '}
          <strong>{formatINR(savedAmount)}</strong> for your current income & deductions
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={barData}
            margin={{ top: 24, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={v => formatINR(v, true)}
              width={72}
            />
            <Tooltip formatter={v => [formatINR(v), 'Total Tax']} />
            <Bar
              dataKey="tax"
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', formatter: v => formatINR(v, true), fontSize: 12, fontWeight: 700 }}
            >
              <Cell fill={regime === 'new' ? '#10b981' : '#d1fae5'} />
              <Cell fill={regime === 'old' ? '#3b82f6' : '#dbeafe'} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Slab Breakdown Table */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-3">
          Slab Breakdown — {regime === 'new' ? 'New' : 'Old'} Regime
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-2 font-semibold">Income Slab</th>
                <th className="pb-2 font-semibold text-right">Rate</th>
                <th className="pb-2 font-semibold text-right">Taxable Amount</th>
                <th className="pb-2 font-semibold text-right">Tax in Slab</th>
              </tr>
            </thead>
            <tbody>
              {slabBreakdown.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-600">{row.label}</td>
                  <td className="py-2 text-right font-bold text-slate-700">{row.rate}%</td>
                  <td className="py-2 text-right text-slate-600">{formatINR(row.slabable)}</td>
                  <td className="py-2 text-right font-bold text-red-600">{formatINR(row.tax)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td className="py-2 text-sm font-bold text-slate-700" colSpan={3}>
                  Total Tax (before cess)
                </td>
                <td className="py-2 text-right font-black text-red-700">
                  {formatINR(currentTax.incomeTax)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* What you can do with saved tax */}
      {savedAmount > 0 && (
        <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <p className="font-bold text-emerald-700 mb-1">
            What you can do with {formatINR(savedAmount)} saved tax
          </p>
          <p className="text-sm text-emerald-700">
            Invest {formatINR(sipEquiv)}/month in an equity SIP — in 10 years that grows to{' '}
            <strong>
              {formatINR(
                sipEquiv * ((Math.pow(1 + 0.12 / 12, 120) - 1) / (0.12 / 12)) * (1 + 0.12 / 12),
                true
              )}
            </strong>{' '}
            at 12% CAGR.
          </p>
          {vacations > 0 && (
            <p className="text-sm text-emerald-600 mt-1">
              Or fund <strong>{vacations} international vacations</strong> (at ~₹80K each) —
              your choice!
            </p>
          )}
        </div>
      )}

      {/* Next Steps */}
      <NextSteps steps={NEXT_STEPS} onNavigate={onNavigate} />
    </div>
  );
}
