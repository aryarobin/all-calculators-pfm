import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import { useCalcState } from '../../hooks/useCalcState';
import { calcEMI, calcEMISchedule, formatINR } from '../../utils/financialCalc';

const LOAN_TYPES = [
  { id: 'home',      label: 'Home',      rate: 8.5,  min: 500000,  max: 500000000, step: 100000, defaultYears: 20, maxYears: 30 },
  { id: 'car',       label: 'Car',       rate: 9.0,  min: 100000,  max: 3000000,   step: 50000,  defaultYears: 7,  maxYears: 10 },
  { id: 'personal',  label: 'Personal',  rate: 12.0, min: 50000,   max: 5000000,   step: 10000,  defaultYears: 5,  maxYears: 7  },
  { id: 'education', label: 'Education', rate: 9.5,  min: 100000,  max: 5000000,   step: 50000,  defaultYears: 10, maxYears: 15 },
];

const PIE_COLORS = ['#2563eb', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function EMICalculator() {
  const [state, update] = useCalcState('emi', {
    loanType: 'home',
    amount: 3000000,
    rate: 8.5,
    years: 20,
  });

  const { loanType, amount, rate, years } = state;
  const loan = LOAN_TYPES.find(l => l.id === loanType) || LOAN_TYPES[0];

  const result = useMemo(() => calcEMI(amount, rate, years), [amount, rate, years]);
  const schedule = useMemo(() => calcEMISchedule(amount, rate, years), [amount, rate, years]);

  const totalInterest = Math.round(result.totalInterest);
  const totalPayment  = Math.round(result.totalPayment);
  const emi           = Math.round(result.emi);
  const interestPct   = ((totalInterest / amount) * 100).toFixed(1);
  const dailyInterest = Math.round(totalInterest / (years * 365));

  const pieData = [
    { name: 'Principal',      value: amount,        color: PIE_COLORS[0] },
    { name: 'Total Interest', value: totalInterest, color: PIE_COLORS[1] },
  ];

  function handleLoanType(lt) {
    update({ loanType: lt.id, rate: lt.rate, years: lt.defaultYears });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Hero EMI */}
      <HeroCard
        label={`${loan.label} loan · ${formatINR(amount, true)} at ${rate}% for ${years} yrs`}
        value={emi}
        rawValue={`${formatINR(emi)}/mo`}
        gradient="blue"
        sub={`${years * 12} monthly payments`}
        meta={[
          { label: 'Total Interest', value: formatINR(totalInterest, true) },
          { label: 'Interest % of Loan', value: `${interestPct}%` },
          { label: 'Daily Cost', value: `${formatINR(dailyInterest)}/day` },
        ]}
      />

      {/* Key Insight Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 font-medium leading-relaxed">
        You pay{' '}
        <span className="font-black text-amber-900">{formatINR(totalInterest)}</span>
        {' '}in interest alone — that's{' '}
        <span className="font-black text-amber-900">{interestPct}%</span>
        {' '}of what you borrowed. Your daily interest cost is{' '}
        <span className="font-black text-amber-900">{formatINR(dailyInterest)}/day</span>.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Controls */}
        <div className="card space-y-5">
          {/* Loan Type Selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Loan Type</p>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map(lt => (
                <button
                  key={lt.id}
                  onClick={() => handleLoanType(lt)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                    loanType === lt.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label="Loan Amount"
            value={amount}
            min={loan.min}
            max={loan.max}
            step={loan.step}
            onChange={v => update({ amount: v })}
            prefix="₹"
          />

          <SliderInput
            label="Annual Interest Rate"
            value={rate}
            min={5}
            max={20}
            step={0.25}
            onChange={v => update({ rate: v })}
            unit="%"
            hint={`${loan.label} loan avg: ~${loan.rate}%`}
          />

          <SliderInput
            label="Loan Tenure"
            value={years}
            min={1}
            max={loan.maxYears}
            onChange={v => update({ years: v })}
            unit=" yrs"
            hint="Longer tenure = lower EMI, higher total interest"
          />

          {/* Rate Impact Panel */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Rate Impact</p>
            <div className="space-y-1.5">
              {[rate - 0.5, rate, rate + 0.5].map(r => {
                if (r <= 0) return null;
                const e = calcEMI(amount, r, years);
                const isActive = r === rate;
                return (
                  <div
                    key={r}
                    className={`flex justify-between items-center py-1.5 px-2 rounded-lg ${
                      isActive ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-sm">{r.toFixed(2)}%</span>
                    <span className="text-sm">
                      {formatINR(Math.round(e.emi))}/mo &nbsp;&middot;&nbsp; {formatINR(Math.round(e.totalInterest), true)} interest
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary + Pie */}
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card bg-slate-50 border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Principal</p>
              <p className="text-xl font-black text-slate-800 mt-1">{formatINR(amount, true)}</p>
            </div>
            <div className="card bg-orange-50 border-orange-100 p-4">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Total Interest</p>
              <p className="text-xl font-black text-orange-700 mt-1">{formatINR(totalInterest, true)}</p>
            </div>
          </div>

          <div className="card bg-red-50 border-red-100 p-4">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Total Amount Payable</p>
            <p className="text-3xl font-black text-red-700 mt-1">{formatINR(totalPayment)}</p>
          </div>

          {/* Pie Chart */}
          <div className="card p-4">
            <p className="text-sm font-bold text-slate-700 mb-3">Principal vs Interest</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={68}
                  innerRadius={36}
                  paddingAngle={3}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatINR(v)} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Principal vs Interest — Per Year</h3>
            <p className="text-xs text-slate-400 mt-0.5">See how your EMI allocation shifts over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-600"></span>
              Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-orange-400"></span>
              Interest
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={schedule.slice(0, 30)} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={v => `Yr ${v}`}
              axisLine={false} tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={v => formatINR(v, true)}
              width={56} axisLine={false} tickLine={false}
            />
            <YAxis
              yAxisId="right" orientation="right"
              tick={{ fontSize: 10, fill: '#cbd5e1' }}
              tickFormatter={v => formatINR(v, true)}
              width={50} axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar yAxisId="left" dataKey="principal" name="Principal" fill="#2563eb" stackId="a" />
            <Bar yAxisId="left" dataKey="interest"  name="Interest"  fill="#f97316" stackId="a" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="balance" name="Outstanding" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slate-400 mt-2 text-center">Bars: yearly principal + interest split · Dashed line: outstanding balance</p>
      </div>

      {/* Next Steps */}
      <div className="card bg-slate-50 border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Related Tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="#fdppf"
            className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <p className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">FD &amp; PPF Calculator</p>
            <p className="text-xs text-slate-400 mt-1">See how your savings grow while you repay</p>
          </a>
          <a
            href="#tax"
            className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <p className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">Tax Calculator</p>
            <p className="text-xs text-slate-400 mt-1">Home loan interest qualifies for Section 24 deduction</p>
          </a>
          <a
            href="#goal"
            className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <p className="font-bold text-slate-800 group-hover:text-blue-700 text-sm">Goal Planning</p>
            <p className="text-xs text-slate-400 mt-1">Plan for down payment or prepayment milestones</p>
          </a>
        </div>
      </div>

    </div>
  );
}
