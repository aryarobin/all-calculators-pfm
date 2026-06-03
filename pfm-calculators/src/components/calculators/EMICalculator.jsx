import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcEMI, calcEMISchedule, formatINR } from '../../utils/financialCalc';

const LOAN_TYPES = [
  { id: 'home', label: '🏠 Home Loan', rate: 8.5, min: 500000, max: 100000000, step: 100000, defaultYears: 20, maxYears: 30 },
  { id: 'car', label: '🚗 Car Loan', rate: 9, min: 100000, max: 3000000, step: 50000, defaultYears: 7, maxYears: 10 },
  { id: 'personal', label: '💳 Personal Loan', rate: 12, min: 50000, max: 5000000, step: 10000, defaultYears: 5, maxYears: 7 },
  { id: 'education', label: '🎓 Education Loan', rate: 9.5, min: 100000, max: 5000000, step: 50000, defaultYears: 10, maxYears: 15 },
  { id: 'gold', label: '🪙 Gold Loan', rate: 10, min: 50000, max: 2000000, step: 10000, defaultYears: 3, maxYears: 5 },
];

export default function EMICalculator() {
  const [loanType, setLoanType] = useState('home');
  const [principal, setPrincipal] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [showSchedule, setShowSchedule] = useState(false);

  const loan = LOAN_TYPES.find(l => l.id === loanType);
  const result = useMemo(() => calcEMI(principal, rate, years), [principal, rate, years]);
  const schedule = useMemo(() => showSchedule ? calcEMISchedule(principal, rate, years) : [], [principal, rate, years, showSchedule]);

  const pieData = [
    { name: 'Principal', value: Math.round(principal), color: '#3b82f6' },
    { name: 'Total Interest', value: Math.round(result.totalInterest), color: '#f97316' },
  ];

  // Bar chart: principal vs interest per year
  const barData = useMemo(() => {
    if (!schedule.length) return calcEMISchedule(principal, rate, years);
    return schedule;
  }, [schedule, principal, rate, years]);

  const interestRatio = result.totalInterest / principal;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">EMI Calculator</h2>
        <p className="text-slate-500 mt-1">Know your exact monthly EMI and total interest cost before taking any loan</p>
      </div>

      {/* Loan type selector */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {LOAN_TYPES.map(l => (
          <button key={l.id} onClick={() => { setLoanType(l.id); setRate(l.rate); setYears(l.defaultYears); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${loanType === l.id ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-lg font-bold text-slate-700 mb-1">💰 How much are you borrowing?</p>
          <SliderInput label="Loan Amount" value={principal} min={loan?.min || 50000} max={loan?.max || 10000000} step={loan?.step || 10000} onChange={setPrincipal} prefix="₹" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Interest rate?</p>
          <p className="text-sm text-slate-400 mb-4">Compare rates from different banks before committing!</p>
          <SliderInput label="Annual Interest Rate" value={rate} min={5} max={20} step={0.25} onChange={setRate} unit="%" hint={`${loan?.label} avg rate: ~${loan?.rate}%`} />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ Loan tenure?</p>
          <p className="text-sm text-slate-400 mb-4">Longer tenure = lower EMI but more total interest.</p>
          <SliderInput label="Loan Tenure" value={years} min={1} max={loan?.maxYears || 30} onChange={setYears} unit=" yrs" />

          {/* Rate comparison */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">💡 Rate Impact</p>
            {[rate - 1, rate, rate + 1].map(r => {
              if (r < 0) return null;
              const e = calcEMI(principal, r, years);
              return (
                <div key={r} className={`flex justify-between py-1 ${r === rate ? 'font-bold text-orange-600' : 'text-slate-500'}`}>
                  <span className="text-sm">{r}% rate</span>
                  <span className="text-sm">{formatINR(e.emi)}/mo → {formatINR(e.totalInterest)} interest</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Monthly EMI</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.emi)}</p>
            <p className="text-sm opacity-75 mt-1">for {years} years ({years * 12} EMIs)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 bg-slate-50 border-slate-100">
              <p className="text-xs font-bold text-slate-500">Total Principal</p>
              <p className="text-xl font-black text-slate-700 mt-1">{formatINR(principal)}</p>
            </div>
            <div className="card p-4 bg-orange-50 border-orange-100">
              <p className="text-xs font-bold text-orange-500">Total Interest Cost</p>
              <p className="text-xl font-black text-orange-700 mt-1">{formatINR(result.totalInterest)}</p>
              <p className="text-xs text-orange-400">{(interestRatio * 100).toFixed(0)}% of principal!</p>
            </div>
          </div>

          <div className="card p-4 bg-red-50 border-red-100">
            <p className="text-xs font-bold text-red-500">Total Amount Payable</p>
            <p className="text-2xl font-black text-red-700">{formatINR(result.totalPayment)}</p>
            <p className="text-sm text-red-500 mt-1">You pay {formatINR(result.totalInterest)} in interest alone 😱</p>
          </div>

          {/* Pie */}
          <div className="card p-4">
            <p className="text-sm font-bold text-slate-600 mb-2">Principal vs Interest Breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={3} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => formatINR(v)} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Yearly breakdown chart */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Principal vs Interest per Year</h3>
          <button onClick={() => setShowSchedule(!showSchedule)} className="text-xs text-orange-600 font-semibold hover:underline">
            {showSchedule ? 'Hide Schedule' : 'Show Full Schedule'}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData.slice(0, 20)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={60} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} labelFormatter={l => `Year ${l}`} />
            <Bar dataKey="principal" name="Principal" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="interest" name="Interest" fill="#f97316" stackId="a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {showSchedule && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-400">Year</th>
                  <th className="text-right py-2 text-slate-400">EMI/mo</th>
                  <th className="text-right py-2 text-slate-400">Principal</th>
                  <th className="text-right py-2 text-slate-400">Interest</th>
                  <th className="text-right py-2 text-slate-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {barData.map(row => (
                  <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-1.5">Yr {row.year}</td>
                    <td className="py-1.5 text-right">{formatINR(row.emi)}</td>
                    <td className="py-1.5 text-right text-blue-600">{formatINR(row.principal)}</td>
                    <td className="py-1.5 text-right text-orange-500">{formatINR(row.interest)}</td>
                    <td className="py-1.5 text-right text-slate-600">{formatINR(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
