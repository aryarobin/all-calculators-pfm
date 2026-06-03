import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcStepUpSIP, calcSIP, formatINR } from '../../utils/financialCalc';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {formatINR(p.value)}</p>
      ))}
    </div>
  );
};

export default function StepUpSIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUp, setStepUp] = useState(10);

  const stepUpResult = useMemo(() => calcStepUpSIP(monthly, rate, years, stepUp), [monthly, rate, years, stepUp]);
  const normalResult = useMemo(() => calcSIP(monthly, rate, years), [monthly, rate, years]);

  const extraWealth = stepUpResult.corpus - normalResult.corpus;
  const extraInvested = stepUpResult.invested - normalResult.invested;
  const extraReturns = extraWealth - extraInvested;

  const finalSIP = useMemo(() => {
    let s = monthly;
    for (let i = 0; i < years; i++) s = s * (1 + stepUp / 100);
    return Math.round(s);
  }, [monthly, years, stepUp]);

  // Chart data combining both
  const chartData = useMemo(() => {
    return stepUpResult.yearlyData.map(row => {
      const norm = calcSIP(monthly, rate, row.year);
      return { ...row, normalCorpus: Math.round(norm.corpus) };
    });
  }, [stepUpResult, monthly, rate]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Step-Up SIP Calculator</h2>
        <p className="text-slate-500 mt-1">Increase SIP with your salary every year — see the massive difference!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-lg font-bold text-slate-700 mb-1">💼 What's your starting monthly SIP?</p>
          <p className="text-sm text-slate-400 mb-4">Start small, grow consistently.</p>
          <SliderInput label="Starting Monthly SIP" value={monthly} min={500} max={50000} step={500} onChange={setMonthly} prefix="₹" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📊 By how much will you increase SIP yearly?</p>
          <p className="text-sm text-slate-400 mb-4">Typically aligned with your salary hike — 10-15% is practical.</p>
          <SliderInput label="Annual Step-Up Rate" value={stepUp} min={0} max={30} step={1} onChange={setStepUp} unit="%" hint="Every year your SIP increases by this %" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 Expected return on investment?</p>
          <p className="text-sm text-slate-400 mb-4">Historical equity MF average: 12-15%</p>
          <SliderInput label="Expected Annual Return" value={rate} min={4} max={20} step={0.5} onChange={setRate} unit="%" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏳ Investment horizon?</p>
          <SliderInput label="Duration" value={years} min={1} max={40} onChange={setYears} unit=" yrs" />

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Your SIP in Year {years}</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{formatINR(finalSIP)}/mo</p>
            <p className="text-xs text-blue-500 mt-1">Starts at {formatINR(monthly)}/mo → grows to this</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-blue-600 to-violet-600 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Step-Up SIP Corpus</p>
            <p className="text-4xl font-black mt-1">{formatINR(stepUpResult.corpus)}</p>
            <p className="text-sm opacity-75 mt-1">vs {formatINR(normalResult.corpus)} without step-up</p>
          </div>

          <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">🔥 Extra Wealth from Step-Up</p>
            <p className="text-3xl font-black text-emerald-700">{formatINR(extraWealth)}</p>
            <div className="flex gap-4 mt-2 text-xs text-emerald-600">
              <span>Extra invested: {formatINR(extraInvested)}</span>
              <span>Extra returns: {formatINR(extraReturns)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-3 bg-orange-50 border-orange-100">
              <p className="text-xs text-orange-500 font-bold">Total Invested</p>
              <p className="text-xl font-black text-orange-700">{formatINR(stepUpResult.invested)}</p>
            </div>
            <div className="card p-3 bg-violet-50 border-violet-100">
              <p className="text-xs text-violet-500 font-bold">Total Returns</p>
              <p className="text-xl font-black text-violet-700">{formatINR(stepUpResult.gains)}</p>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Step-Up Power</p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              🚀 Step-up creates {formatINR(extraWealth)} extra vs flat SIP!
            </p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              📈 {stepUp}% yearly increase × {years} years = corpus grows by {extraWealth > 0 ? Math.round(extraWealth / normalResult.corpus * 100) : 0}% more
            </p>
            <p className="text-sm text-amber-800 font-medium">
              💼 Match SIP hikes with salary hikes — painless wealth building!
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card mt-6">
        <div className="mb-4">
          <h3 className="font-bold text-slate-700">Step-Up vs Fixed SIP Comparison</h3>
          <p className="text-xs text-slate-400">See how much extra wealth step-up SIP creates</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="normGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="corpus" name="Step-Up SIP" stroke="#7c3aed" strokeWidth={2.5} fill="url(#stepGrad)" />
            <Area type="monotone" dataKey="normalCorpus" name="Fixed SIP" stroke="#f97316" strokeWidth={2} fill="url(#normGrad)" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
