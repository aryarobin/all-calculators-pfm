import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcFD, calcRD, calcPPF, calcNPS, formatINR } from '../../utils/financialCalc';

const TABS = [
  { id: 'fd', label: '🏦 FD', name: 'Fixed Deposit' },
  { id: 'rd', label: '📅 RD', name: 'Recurring Deposit' },
  { id: 'ppf', label: '🛡️ PPF', name: 'Public Provident Fund' },
  { id: 'nps', label: '🏛️ NPS', name: 'National Pension System' },
];

export default function FDPPFCalculator() {
  const [tab, setTab] = useState('fd');

  // FD state
  const [fdPrincipal, setFdPrincipal] = useState(100000);
  const [fdRate, setFdRate] = useState(7);
  const [fdYears, setFdYears] = useState(5);

  // RD state
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(6.5);
  const [rdYears, setRdYears] = useState(5);

  // PPF state
  const [ppfYearly, setPpfYearly] = useState(150000);
  const [ppfYears, setPpfYears] = useState(15);

  // NPS state
  const [npsMonthly, setNpsMonthly] = useState(5000);
  const [npsYears, setNpsYears] = useState(25);
  const [npsReturn, setNpsReturn] = useState(10);

  const fdResult = useMemo(() => calcFD(fdPrincipal, fdRate, fdYears), [fdPrincipal, fdRate, fdYears]);
  const rdResult = useMemo(() => calcRD(rdMonthly, rdRate, rdYears), [rdMonthly, rdRate, rdYears]);
  const ppfResult = useMemo(() => calcPPF(ppfYearly, ppfYears), [ppfYearly, ppfYears]);
  const npsResult = useMemo(() => calcNPS(npsMonthly, npsYears, npsReturn), [npsMonthly, npsYears, npsReturn]);

  // Chart data
  const fdChartData = useMemo(() => Array.from({ length: fdYears }, (_, i) => ({
    year: i + 1,
    maturity: Math.round(calcFD(fdPrincipal, fdRate, i + 1).maturity),
    principal: fdPrincipal,
  })), [fdPrincipal, fdRate, fdYears]);

  const ppfChartData = useMemo(() => ppfResult.yearlyData, [ppfResult]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">FD / RD / PPF / NPS Calculator</h2>
        <p className="text-slate-500 mt-1">Calculate returns on India's most popular safe investment instruments</p>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit mx-auto flex-wrap justify-center">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">🏦 Fixed Deposit Calculator</p>
            <p className="text-sm text-slate-400 mb-4">Capital-guaranteed, government-backed returns.</p>
            <SliderInput label="Deposit Amount" value={fdPrincipal} min={10000} max={10000000} step={10000} onChange={setFdPrincipal} prefix="₹" />
            <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 Interest Rate?</p>
            <p className="text-sm text-slate-400 mb-4">SBI: 7%, HDFC: 7.1%, Small Finance Banks: up to 9%</p>
            <SliderInput label="Annual Interest Rate" value={fdRate} min={4} max={9} step={0.25} onChange={setFdRate} unit="%" hint="Compounded quarterly" />
            <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ FD Tenure?</p>
            <SliderInput label="Tenure" value={fdYears} min={1} max={10} onChange={setFdYears} unit=" yrs" />

            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-2">⚠️ Tax Note</p>
              <p className="text-sm text-blue-800">FD interest is taxable as per your slab. TDS deducted if interest &gt; ₹40,000/yr.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
              <p className="text-sm font-semibold opacity-80">Maturity Amount</p>
              <p className="text-4xl font-black mt-1">{formatINR(fdResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">in {fdYears} years at {fdRate}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500">Principal</p>
                <p className="text-xl font-black text-slate-700">{formatINR(fdPrincipal)}</p>
              </div>
              <div className="card p-4 bg-emerald-50">
                <p className="text-xs font-bold text-emerald-500">Interest Earned</p>
                <p className="text-xl font-black text-emerald-700">{formatINR(fdResult.interest)}</p>
              </div>
            </div>
            <div className="card mt-4">
              <p className="text-xs font-bold text-slate-500 mb-2">Growth Chart</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={fdChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={v => formatINR(v)} />
                  <Area type="monotone" dataKey="maturity" name="FD Value" stroke="#3b82f6" fill="#eff6ff" />
                  <Area type="monotone" dataKey="principal" name="Principal" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'rd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">📅 Recurring Deposit</p>
            <p className="text-sm text-slate-400 mb-4">Save monthly, earn guaranteed returns.</p>
            <SliderInput label="Monthly Deposit" value={rdMonthly} min={500} max={100000} step={500} onChange={setRdMonthly} prefix="₹" />
            <SliderInput label="Annual Interest Rate" value={rdRate} min={4} max={9} step={0.25} onChange={setRdRate} unit="%" />
            <SliderInput label="Tenure" value={rdYears} min={1} max={10} onChange={setRdYears} unit=" yrs" />
          </div>
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
              <p className="text-sm font-semibold opacity-80">Maturity Amount</p>
              <p className="text-4xl font-black mt-1">{formatINR(rdResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">in {rdYears} years</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500">Total Deposited</p>
                <p className="text-xl font-black text-slate-700">{formatINR(rdResult.invested)}</p>
              </div>
              <div className="card p-4 bg-emerald-50">
                <p className="text-xs font-bold text-emerald-500">Interest</p>
                <p className="text-xl font-black text-emerald-700">{formatINR(rdResult.interest)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'ppf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">🛡️ Public Provident Fund</p>
            <p className="text-sm text-slate-400 mb-4">EEE tax status: exempt at investment, growth, and withdrawal. Best safe instrument in India!</p>
            <SliderInput label="Yearly Investment" value={ppfYearly} min={500} max={150000} step={1000} onChange={setPpfYearly} prefix="₹" hint="Max ₹1.5L per year (eligible for 80C)" />
            <SliderInput label="PPF Duration" value={ppfYears} min={15} max={50} step={5} onChange={setPpfYears} unit=" yrs" hint="Minimum 15 years; can extend by 5 years" />
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 mb-1">✅ PPF Advantages</p>
              <p className="text-sm text-emerald-800">• Current rate: 7.1% per year • Fully tax-free maturity • Govt-backed security • 80C benefit up to ₹1.5L</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-emerald-600 to-green-700 text-white border-0">
              <p className="text-sm font-semibold opacity-80">PPF Maturity Value</p>
              <p className="text-4xl font-black mt-1">{formatINR(ppfResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">TAX FREE after {ppfYears} years!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500">Total Invested</p>
                <p className="text-xl font-black text-slate-700">{formatINR(ppfResult.totalInvested)}</p>
              </div>
              <div className="card p-4 bg-emerald-50">
                <p className="text-xs font-bold text-emerald-500">Tax-Free Interest</p>
                <p className="text-xl font-black text-emerald-700">{formatINR(ppfResult.totalInterest)}</p>
              </div>
            </div>
            <div className="card">
              <p className="text-xs font-bold text-slate-500 mb-2">PPF Balance Growth</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ppfChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={v => formatINR(v)} />
                  <Area type="monotone" dataKey="balance" name="Balance" stroke="#10b981" fill="#ecfdf5" />
                  <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'nps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <p className="text-lg font-bold text-slate-700 mb-1">🏛️ National Pension System</p>
            <p className="text-sm text-slate-400 mb-4">Build a retirement corpus with extra tax benefits beyond 80C.</p>
            <SliderInput label="Monthly Contribution" value={npsMonthly} min={500} max={100000} step={500} onChange={setNpsMonthly} prefix="₹" hint="Additional ₹50,000 deduction under 80CCD(1B)" />
            <SliderInput label="Years to Retirement" value={npsYears} min={5} max={40} onChange={setNpsYears} unit=" yrs" />
            <SliderInput label="Expected Annual Return" value={npsReturn} min={6} max={14} step={0.5} onChange={setNpsReturn} unit="%" hint="Aggressive: 12%, Moderate: 10%, Conservative: 8%" />
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-1">🏛️ NPS Rules</p>
              <p className="text-sm text-blue-800">• 60% lumpsum at 60 (partially tax-free) • 40% must buy annuity • Extra ₹50K tax deduction</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-0">
              <p className="text-sm font-semibold opacity-80">NPS Corpus at Retirement</p>
              <p className="text-4xl font-black mt-1">{formatINR(npsResult.corpus)}</p>
              <p className="text-sm opacity-75 mt-1">in {npsYears} years at {npsReturn}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-blue-50">
                <p className="text-xs font-bold text-blue-500">Lumpsum (60%)</p>
                <p className="text-xl font-black text-blue-700">{formatINR(npsResult.lumpsum)}</p>
                <p className="text-xs text-blue-400">Withdraw at 60</p>
              </div>
              <div className="card p-4 bg-purple-50">
                <p className="text-xs font-bold text-purple-500">Annuity (40%)</p>
                <p className="text-xl font-black text-purple-700">{formatINR(npsResult.annuityCorpus)}</p>
                <p className="text-xs text-purple-400">Monthly pension</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-100">
              <p className="text-xs font-bold text-purple-600">Monthly Pension Estimate</p>
              <p className="text-3xl font-black text-purple-700 mt-1">{formatINR(npsResult.monthlyPension)}/mo</p>
              <p className="text-xs text-purple-400 mt-1">Based on 6% annuity rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
