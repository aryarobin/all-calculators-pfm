import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { formatINR } from '../../utils/financialCalc';

function calcCTCBreakdown(ctc, regime = 'new') {
  const basic = ctc * 0.4;
  const hra = ctc * 0.2;
  const ta = Math.min(19200, ctc * 0.05);
  const medical = 15000;
  const specialAllowance = ctc - basic - hra - ta - medical;
  const pfEmployee = Math.min(basic * 0.12, 1800 * 12);
  const pfEmployer = Math.min(basic * 0.12, 1800 * 12);
  const grossSalary = basic + hra + ta + medical + specialAllowance;

  const standardDeduction = regime === 'new' ? 75000 : 50000;
  const hraExemption = regime === 'old' ? Math.min(hra, basic * 0.5) : 0;
  const ltaExemption = regime === 'old' ? 0 : 0;
  const deduction80C = regime === 'old' ? Math.min(pfEmployee + 150000, 150000) : 0;

  let taxableIncome = grossSalary - standardDeduction - hraExemption - deduction80C - pfEmployee;
  taxableIncome = Math.max(0, taxableIncome);

  let tax = 0;
  if (regime === 'new') {
    const slabs = [[0, 400000, 0], [400000, 800000, 5], [800000, 1200000, 10], [1200000, 1600000, 15], [1600000, 2000000, 20], [2000000, 2400000, 25], [2400000, Infinity, 30]];
    for (const [from, to, rate] of slabs) {
      if (taxableIncome <= from) break;
      tax += Math.min(taxableIncome, to) - from > 0 ? (Math.min(taxableIncome, to) - from) * rate / 100 : 0;
    }
    if (taxableIncome <= 700000) tax = 0;
  } else {
    const slabs = [[0, 250000, 0], [250000, 500000, 5], [500000, 1000000, 20], [1000000, Infinity, 30]];
    for (const [from, to, rate] of slabs) {
      if (taxableIncome <= from) break;
      tax += (Math.min(taxableIncome, to) - from) * rate / 100;
    }
    if (taxableIncome <= 500000) tax = 0;
  }
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  const inHand = grossSalary - totalTax - pfEmployee;
  const monthlyInHand = inHand / 12;

  return { ctc, basic, hra, ta, medical, specialAllowance, grossSalary, pfEmployee, pfEmployer, taxableIncome, totalTax, cess, inHand, monthlyInHand, standardDeduction, hraExemption, deduction80C };
}

function calcGratuity(lastBasic, yearsOfService) {
  if (yearsOfService < 5) return 0;
  return (lastBasic / 26) * 15 * yearsOfService;
}

export default function SalaryCalculator() {
  const [tab, setTab] = useState('ctc');
  const [ctc, setCtc] = useState(1500000);
  const [regime, setRegime] = useState('new');
  const [lastBasic, setLastBasic] = useState(50000);
  const [yearsOfService, setYearsOfService] = useState(10);
  const [rentPaid, setRentPaid] = useState(20000);
  const [isMetro, setIsMetro] = useState(true);

  const breakdown = useMemo(() => calcCTCBreakdown(ctc, regime), [ctc, regime]);
  const gratuity = useMemo(() => calcGratuity(lastBasic, yearsOfService), [lastBasic, yearsOfService]);

  const hraExempt = useMemo(() => {
    const basic = ctc * 0.4;
    const hraReceived = ctc * 0.2;
    const rentMinus10 = Math.max(0, rentPaid * 12 - basic * 0.1);
    const metroLimit = basic * (isMetro ? 0.5 : 0.4);
    return Math.min(hraReceived, rentMinus10, metroLimit);
  }, [ctc, rentPaid, isMetro]);

  const pieData = [
    { name: 'In-Hand', value: Math.round(breakdown.inHand), color: '#10b981' },
    { name: 'Income Tax + Cess', value: Math.round(breakdown.totalTax), color: '#ef4444' },
    { name: 'PF (Employee)', value: Math.round(breakdown.pfEmployee), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Salary & Tax Tools</h2>
        <p className="text-slate-500 mt-1">CTC breakdown, in-hand salary, HRA exemption, gratuity</p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl flex-wrap justify-center mx-auto">
        {[['ctc', '💼 CTC Breakdown'], ['hra', '🏠 HRA Exemption'], ['gratuity', '🏆 Gratuity']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'ctc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">💼 What's your Annual CTC?</p>
            <SliderInput label="Annual CTC" value={ctc} min={300000} max={20000000} step={100000} onChange={setCtc} prefix="₹" hint="Cost to Company — before any deductions" />

            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 mt-4">Tax Regime</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {['new', 'old'].map(r => (
                <button key={r} onClick={() => setRegime(r)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${regime === r ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500'}`}>
                  {r === 'new' ? '🆕 New Regime' : '📋 Old Regime'}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">CTC Structure (Typical)</p>
              {[
                { label: 'Basic Salary (40%)', val: breakdown.basic },
                { label: 'HRA (20%)', val: breakdown.hra },
                { label: 'Transport Allowance', val: breakdown.ta },
                { label: 'Medical Allowance', val: breakdown.medical },
                { label: 'Special Allowance', val: breakdown.specialAllowance },
                { label: 'PF Employer (12%)', val: breakdown.pfEmployer },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-bold text-slate-700">{formatINR(item.val)}/yr</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Monthly In-Hand Salary</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(breakdown.monthlyInHand)}</p>
              <p className="text-sm opacity-75 mt-1">Annual: {formatINR(breakdown.inHand)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-red-50 border-red-100">
                <p className="text-xs font-bold text-red-500">Annual Tax (incl. cess)</p>
                <p className="text-xl font-black text-red-700">{formatINR(breakdown.totalTax)}</p>
                <p className="text-xs text-red-400">Effective: {breakdown.grossSalary > 0 ? (breakdown.totalTax / breakdown.grossSalary * 100).toFixed(1) : 0}%</p>
              </div>
              <div className="card p-4 bg-blue-50 border-blue-100">
                <p className="text-xs font-bold text-blue-500">PF (Your Share)</p>
                <p className="text-xl font-black text-blue-700">{formatINR(breakdown.pfEmployee)}</p>
                <p className="text-xs text-blue-400">12% of basic</p>
              </div>
            </div>

            <div className="card p-4">
              <p className="text-xs font-bold text-slate-500 mb-3">CTC vs In-Hand Split</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card bg-amber-50 border-amber-100">
              <p className="text-xs font-bold text-amber-600 mb-1">📊 Detailed Breakdown</p>
              {[
                { l: 'Gross Salary', v: formatINR(breakdown.grossSalary) },
                { l: 'Standard Deduction', v: `-${formatINR(breakdown.standardDeduction)}` },
                { l: 'Taxable Income', v: formatINR(breakdown.taxableIncome), bold: true },
                { l: 'Income Tax', v: formatINR(breakdown.totalTax), red: true },
                { l: 'Annual In-Hand', v: formatINR(breakdown.inHand), green: true },
              ].map(row => (
                <div key={row.l} className={`flex justify-between py-1 border-b border-amber-100 ${row.bold ? 'font-bold' : ''}`}>
                  <span className="text-xs text-amber-700">{row.l}</span>
                  <span className={`text-xs font-bold ${row.green ? 'text-emerald-700' : row.red ? 'text-red-700' : 'text-amber-800'}`}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'hra' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">🏠 HRA Exemption Calculator</p>
            <p className="text-sm text-slate-400 mb-4">HRA exemption is min of: actual HRA, 50%/40% of basic, or rent paid minus 10% of basic.</p>
            <SliderInput label="Annual CTC" value={ctc} min={300000} max={20000000} step={100000} onChange={setCtc} prefix="₹" />
            <SliderInput label="Monthly Rent Paid" value={rentPaid} min={0} max={100000} step={1000} onChange={setRentPaid} prefix="₹" />
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">City Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsMetro(true)} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${isMetro ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500'}`}>
                  🌆 Metro City<br /><span className="text-xs font-normal">50% of Basic</span>
                </button>
                <button onClick={() => setIsMetro(false)} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${!isMetro ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500'}`}>
                  🏘️ Non-Metro<br /><span className="text-xs font-normal">40% of Basic</span>
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">HRA Exemption (Annual)</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(hraExempt)}</p>
              <p className="text-sm opacity-75 mt-1">Saves {formatINR(hraExempt * 0.3)} in tax (at 30% slab)</p>
            </div>
            <div className="card bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">HRA Exemption = Minimum of:</p>
              {[
                { label: 'Actual HRA received', val: ctc * 0.2 },
                { label: `${isMetro ? '50%' : '40%'} of Basic (${isMetro ? 'Metro' : 'Non-Metro'})`, val: ctc * 0.4 * (isMetro ? 0.5 : 0.4) },
                { label: 'Rent paid - 10% of Basic', val: Math.max(0, rentPaid * 12 - ctc * 0.4 * 0.1) },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between py-2 border-b border-slate-100 ${item.val === hraExempt ? 'font-bold text-orange-600 bg-orange-50 px-2 rounded-lg' : ''}`}>
                  <span className="text-sm text-slate-600">{item.label} {item.val === hraExempt && '← MINIMUM'}</span>
                  <span className="text-sm font-bold">{formatINR(item.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'gratuity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">🏆 Gratuity Calculator</p>
            <p className="text-sm text-slate-400 mb-4">Gratuity = (Last Basic / 26) × 15 × Years of Service. Eligible after 5 years.</p>
            <SliderInput label="Last Drawn Basic Salary (Monthly)" value={lastBasic} min={10000} max={500000} step={5000} onChange={setLastBasic} prefix="₹" />
            <SliderInput label="Years of Service" value={yearsOfService} min={1} max={40} onChange={setYearsOfService} unit=" yrs" hint="Minimum 5 years to be eligible" />
          </div>
          <div className="space-y-4">
            <div className={`card border-0 text-white ${yearsOfService >= 5 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">
                {yearsOfService >= 5 ? 'Gratuity Amount' : 'Not Eligible Yet'}
              </p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{yearsOfService >= 5 ? formatINR(gratuity) : '—'}</p>
              <p className="text-sm opacity-75 mt-1">
                {yearsOfService >= 5 ? `Tax-free up to ₹20L` : `Need ${5 - yearsOfService} more year(s) of service`}
              </p>
            </div>
            {yearsOfService >= 5 && (
              <div className="card bg-amber-50 border-amber-100">
                <p className="text-xs font-bold text-amber-600 mb-2">📝 Calculation</p>
                <p className="text-sm text-amber-800">(₹{lastBasic.toLocaleString('en-IN')} ÷ 26) × 15 × {yearsOfService} years = <strong>{formatINR(gratuity)}</strong></p>
                <p className="text-xs text-amber-600 mt-2">✅ Gratuity up to ₹20L is fully tax-exempt for private employees</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
