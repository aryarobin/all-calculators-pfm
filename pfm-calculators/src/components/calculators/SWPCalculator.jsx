import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { formatINR } from '../../utils/financialCalc';

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

export default function SWPCalculator() {
  const [corpus, setCorpus] = useState(10000000);
  const [monthly, setMonthly] = useState(50000);
  const [returnRate, setReturnRate] = useState(8);
  const [years, setYears] = useState(25);

  const maxMonthly = useMemo(() => Math.round(calcMaxSWP(corpus, returnRate, years)), [corpus, returnRate, years]);
  const result = useMemo(() => calcSWP(corpus, monthly, returnRate, years), [corpus, monthly, returnRate, years]);

  const perpetualWithdrawal = useMemo(() => Math.round(corpus * returnRate / 100 / 12), [corpus, returnRate]);

  const sustainable = monthly <= maxMonthly;
  const corpusLastsYears = result.depletedAt ? (result.depletedAt / 12).toFixed(1) : `${years}+`;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">SWP — Systematic Withdrawal Plan</h2>
        <p className="text-slate-500 mt-1">You've built the corpus. Now how do you turn it into monthly income?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-lg font-bold text-slate-700 mb-1">💰 What is your retirement corpus?</p>
          <p className="text-sm text-slate-400 mb-4">The total wealth you've accumulated.</p>
          <SliderInput label="Total Corpus" value={corpus} min={1000000} max={100000000} step={500000} onChange={setCorpus} prefix="₹" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📅 How much do you want to withdraw monthly?</p>
          <p className="text-sm text-slate-400 mb-4">Your desired monthly income in retirement.</p>
          <SliderInput label="Monthly Withdrawal" value={monthly} min={10000} max={500000} step={5000} onChange={setMonthly} prefix="₹" hint={`Max sustainable for ${years} yrs: ${formatINR(maxMonthly)}/mo`} />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 Return on corpus post-retirement?</p>
          <SliderInput label="Annual Return on Corpus" value={returnRate} min={4} max={12} step={0.5} onChange={setReturnRate} unit="%" hint="Conservative: FD/Debt funds. Moderate: Balanced." />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ For how many years?</p>
          <SliderInput label="Withdrawal Period" value={years} min={5} max={50} onChange={setYears} unit=" yrs" />

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 mb-1">🔁 Forever (Perpetual) Withdrawal</p>
            <p className="text-2xl font-black text-blue-700">{formatINR(perpetualWithdrawal)}/mo</p>
            <p className="text-xs text-blue-500">Withdraw only interest — corpus never depletes!</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`card border-0 text-white ${sustainable ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">
              {sustainable ? '✅ Sustainable Withdrawal' : '⚠️ Corpus Will Deplete!'}
            </p>
            <p className="text-4xl font-black mt-1">{formatINR(monthly)}/mo</p>
            <p className="text-sm opacity-75 mt-1">
              {sustainable
                ? `Corpus lasts ${years}+ years. Final balance: ${formatINR(result.finalBalance)}`
                : `Corpus depletes in ${corpusLastsYears} years!`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 bg-amber-50 border-amber-100">
              <p className="text-xs font-bold text-amber-500">Total Withdrawn ({years} yrs)</p>
              <p className="text-xl font-black text-amber-700">{formatINR(result.totalWithdrawn)}</p>
            </div>
            <div className={`card p-4 ${result.finalBalance > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-xs font-bold ${result.finalBalance > 0 ? 'text-emerald-500' : 'text-red-500'}`}>Final Balance</p>
              <p className={`text-xl font-black ${result.finalBalance > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatINR(result.finalBalance)}</p>
            </div>
          </div>

          <div className="card bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Withdrawal Strategies</p>
            {[
              { label: 'Conservative (only interest)', monthly: perpetualWithdrawal, note: 'Corpus never depletes' },
              { label: `Sustainable (${years} yrs)`, monthly: maxMonthly, note: 'Depletes exactly in timeline' },
              { label: '4% Safe Withdrawal Rate', monthly: Math.round(corpus * 0.04 / 12), note: 'Global FIRE community standard' },
            ].map(s => (
              <button key={s.label} onClick={() => setMonthly(s.monthly)}
                className="w-full flex justify-between items-center py-2 border-b border-slate-100 hover:bg-orange-50 px-2 rounded-lg transition-all text-left">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.note}</p>
                </div>
                <span className="text-sm font-black text-orange-600">{formatINR(s.monthly)}/mo</span>
              </button>
            ))}
          </div>

          <div className="card bg-amber-50 border-amber-100">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 SWP vs FD Interest</p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              📊 SWP from equity MF is more tax-efficient than FD interest
            </p>
            <p className="text-sm text-amber-800 font-medium">
              🏦 FD interest is taxed at slab rate; LTCG exemption up to ₹1.25L/yr
            </p>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-bold text-slate-700 mb-4">Corpus Depletion Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={result.data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="swpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="balance" name="Corpus Balance" stroke={sustainable ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#swpGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
