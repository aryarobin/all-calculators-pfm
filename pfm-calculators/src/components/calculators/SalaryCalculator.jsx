import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
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

  return { ctc, basic, hra, ta, medical, specialAllowance, grossSalary, pfEmployee, pfEmployer, taxableIncome, totalTax, cess, inHand, monthlyInHand: inHand / 12, standardDeduction, hraExemption, deduction80C };
}

function calcGratuity(lastBasic, yearsOfService) {
  if (yearsOfService < 5) return 0;
  return (lastBasic / 26) * 15 * yearsOfService;
}

const TABS = [['ctc', 'CTC Breakdown'], ['hra', 'HRA Exemption'], ['gratuity', 'Gratuity']];

export default function SalaryCalculator({ onNavigate }) {
  const [s, set] = useCalcState('salary', {
    tab: 'ctc', ctc: 1500000, regime: 'new',
    lastBasic: 50000, yearsOfService: 10, rentPaid: 20000, isMetro: true,
  });

  const breakdown = useMemo(() => calcCTCBreakdown(s.ctc, s.regime), [s.ctc, s.regime]);
  const gratuity = useMemo(() => calcGratuity(s.lastBasic, s.yearsOfService), [s.lastBasic, s.yearsOfService]);

  const hraExempt = useMemo(() => {
    const basic = s.ctc * 0.4;
    const hraReceived = s.ctc * 0.2;
    const rentMinus10 = Math.max(0, s.rentPaid * 12 - basic * 0.1);
    const metroLimit = basic * (s.isMetro ? 0.5 : 0.4);
    return Math.min(hraReceived, rentMinus10, metroLimit);
  }, [s.ctc, s.rentPaid, s.isMetro]);

  const pieData = [
    { name: 'In-Hand', value: Math.round(breakdown.inHand), color: '#10b981' },
    { name: 'Tax + Cess', value: Math.round(breakdown.totalTax), color: '#ef4444' },
    { name: 'PF', value: Math.round(breakdown.pfEmployee), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
        {TABS.map(([t, l]) => (
          <button key={t} onClick={() => set({ tab: t })}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${s.tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── CTC ──────────────────────────────────────────────────────── */}
      {s.tab === 'ctc' && (
        <>
          <HeroCard
            label={`On ${formatINR(s.ctc, true)} CTC · ${s.regime} regime`}
            value={breakdown.monthlyInHand}
            gradient="emerald"
            sub={`Annual in-hand: ${formatINR(breakdown.inHand)}`}
            meta={[
              { label: 'Annual Tax', value: formatINR(breakdown.totalTax, true) },
              { label: 'Effective Rate', value: `${breakdown.grossSalary > 0 ? (breakdown.totalTax / breakdown.grossSalary * 100).toFixed(1) : 0}%` },
              { label: 'Your PF', value: formatINR(breakdown.pfEmployee, true) },
            ]}
          />

          <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Salary</p>
            <SliderInput label="Annual CTC" hint="Cost to company, before deductions · tap to type" value={s.ctc} min={300000} max={100000000} step={100000} onChange={v => set({ ctc: v })} prefix="₹" />
            <p className="text-xs font-semibold text-slate-500 mb-2">Tax Regime</p>
            <div className="grid grid-cols-2 gap-2">
              {['new', 'old'].map(r => (
                <button key={r} onClick={() => set({ regime: r })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${s.regime === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {r === 'new' ? 'New Regime' : 'Old Regime'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CTC structure */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">CTC Structure (typical)</p>
              {[
                { label: 'Basic Salary (40%)', val: breakdown.basic },
                { label: 'HRA (20%)', val: breakdown.hra },
                { label: 'Transport Allowance', val: breakdown.ta },
                { label: 'Medical Allowance', val: breakdown.medical },
                { label: 'Special Allowance', val: breakdown.specialAllowance },
                { label: 'PF (Employer)', val: breakdown.pfEmployer },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-700 tabular-nums">{formatINR(item.val)}/yr</span>
                </div>
              ))}
            </div>

            {/* Pie + breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Where your CTC goes</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 pt-3 border-t border-slate-100">
                {[
                  { l: 'Gross Salary', v: formatINR(breakdown.grossSalary) },
                  { l: 'Taxable Income', v: formatINR(breakdown.taxableIncome), bold: true },
                  { l: 'Annual In-Hand', v: formatINR(breakdown.inHand), green: true },
                ].map(row => (
                  <div key={row.l} className={`flex justify-between py-1 ${row.bold ? 'font-semibold' : ''}`}>
                    <span className="text-xs text-slate-500">{row.l}</span>
                    <span className={`text-xs font-bold tabular-nums ${row.green ? 'text-emerald-700' : 'text-slate-700'}`}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── HRA ──────────────────────────────────────────────────────── */}
      {s.tab === 'hra' && (
        <>
          <HeroCard
            label="HRA Exemption (annual)"
            value={hraExempt}
            gradient="indigo"
            sub={`Saves about ${formatINR(hraExempt * 0.3)} in tax at the 30% slab`}
          />
          <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Details</p>
            <SliderInput label="Annual CTC" value={s.ctc} min={300000} max={100000000} step={100000} onChange={v => set({ ctc: v })} prefix="₹" />
            <SliderInput label="Monthly Rent Paid" value={s.rentPaid} min={0} max={300000} step={1000} onChange={v => set({ rentPaid: v })} prefix="₹" />
            <p className="text-xs font-semibold text-slate-500 mb-2">City Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => set({ isMetro: true })} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${s.isMetro ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                Metro City<br /><span className="text-xs font-normal opacity-70">50% of Basic</span>
              </button>
              <button onClick={() => set({ isMetro: false })} className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${!s.isMetro ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                Non-Metro<br /><span className="text-xs font-normal opacity-70">40% of Basic</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">HRA exemption = minimum of these three</p>
            {[
              { label: 'Actual HRA received', val: s.ctc * 0.2 },
              { label: `${s.isMetro ? '50%' : '40%'} of Basic (${s.isMetro ? 'Metro' : 'Non-Metro'})`, val: s.ctc * 0.4 * (s.isMetro ? 0.5 : 0.4) },
              { label: 'Rent paid − 10% of Basic', val: Math.max(0, s.rentPaid * 12 - s.ctc * 0.4 * 0.1) },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between items-center py-2.5 px-3 rounded-lg mb-1 ${Math.abs(item.val - hraExempt) < 1 ? 'bg-emerald-50 border border-emerald-100' : ''}`}>
                <span className="text-sm text-slate-600">{item.label}{Math.abs(item.val - hraExempt) < 1 && <span className="ml-1.5 text-[10px] font-bold text-emerald-600">← LOWEST</span>}</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">{formatINR(item.val)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Gratuity ─────────────────────────────────────────────────── */}
      {s.tab === 'gratuity' && (
        <>
          <HeroCard
            label={s.yearsOfService >= 5 ? 'Gratuity Amount' : 'Not Eligible Yet'}
            value={s.yearsOfService >= 5 ? gratuity : 0}
            rawValue={s.yearsOfService >= 5 ? undefined : '—'}
            gradient={s.yearsOfService >= 5 ? 'amber' : 'slate'}
            sub={s.yearsOfService >= 5 ? 'Tax-free up to ₹20 lakh for private employees' : `Need ${5 - s.yearsOfService} more year(s) of service to qualify`}
          />
          <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Service</p>
            <SliderInput label="Last Drawn Monthly Basic" value={s.lastBasic} min={10000} max={1000000} step={5000} onChange={v => set({ lastBasic: v })} prefix="₹" />
            <SliderInput label="Years of Service" value={s.yearsOfService} min={1} max={40} onChange={v => set({ yearsOfService: v })} unit=" yr" hint="Minimum 5 years to be eligible" />
          </div>
          {s.yearsOfService >= 5 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Formula</p>
              <p className="text-sm text-slate-600">
                (₹{s.lastBasic.toLocaleString('en-IN')} ÷ 26) × 15 × {s.yearsOfService} years = <strong className="text-slate-900">{formatINR(gratuity)}</strong>
              </p>
            </div>
          )}
        </>
      )}

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'tax', label: 'Income Tax', desc: 'Full new vs old regime comparison' },
        { id: 'budget', label: 'Budget Planner', desc: 'Allocate your take-home pay' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Invest your monthly surplus' },
      ]} />
    </div>
  );
}
