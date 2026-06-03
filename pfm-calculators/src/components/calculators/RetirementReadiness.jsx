import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PieChart, Pie, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcInflation, calcSIP, calcSIPFromCorpus, calcFD, calcPPF, calcNPS, calcLumpsum, formatINR } from '../../utils/financialCalc';

const ASSET_RATES = {
  savings: { label: '🏦 Savings Account', defaultRate: 3.5, color: '#94a3b8' },
  fd: { label: '🏦 FD / RD', defaultRate: 7, color: '#3b82f6' },
  ppf_epf: { label: '🛡️ PPF / EPF', defaultRate: 8.1, color: '#10b981' },
  mf: { label: '📈 Mutual Funds', defaultRate: 12, color: '#f97316' },
  stocks: { label: '📊 Stocks', defaultRate: 15, color: '#7c3aed' },
  gold: { label: '🪙 Gold', defaultRate: 8, color: '#f59e0b' },
  realestate: { label: '🏠 Real Estate', defaultRate: 9, color: '#06b6d4' },
};

const defaultNetWorth = { savings: 500000, fd: 6000000, ppf_epf: 5000000, mf: 3600000, stocks: 2000000, gold: 7000000, realestate: 0 };
const defaultMonthly = { savings: 0, fd: 30000, ppf_epf: 20000, mf: 100000, stocks: 50000, gold: 0, realestate: 0 };

export default function RetirementReadiness() {
  const [currentAge, setCurrentAge] = useState(44);
  const [retirementAge, setRetirementAge] = useState(65);
  const [lifeExpectancy, setLifeExpectancy] = useState(75);
  const [targetCorpus, setTargetCorpus] = useState(10000000);
  const [inflation, setInflation] = useState(5);
  const [postReturnRate, setPostReturnRate] = useState(8);

  const [netWorth, setNetWorth] = useState(defaultNetWorth);
  const [monthly, setMonthly] = useState(defaultMonthly);

  const yearsToRetire = retirementAge - currentAge;
  const inflatedCorpus = useMemo(() => calcInflation(targetCorpus, inflation, yearsToRetire), [targetCorpus, inflation, yearsToRetire]);

  // Project each asset
  const assetProjections = useMemo(() => {
    return Object.entries(ASSET_RATES).map(([key, info]) => {
      const existingProjected = (netWorth[key] || 0) * Math.pow(1 + info.defaultRate / 100, yearsToRetire);
      const monthlyProjected = monthly[key] ? calcSIP(monthly[key], info.defaultRate, yearsToRetire).corpus : 0;
      return {
        key, ...info,
        existingNW: netWorth[key] || 0,
        existingProjected,
        monthlyContrib: monthly[key] || 0,
        monthlyProjected,
        total: existingProjected + monthlyProjected,
      };
    }).filter(a => a.existingNW > 0 || a.monthlyContrib > 0);
  }, [netWorth, monthly, yearsToRetire]);

  const totalProjected = useMemo(() => assetProjections.reduce((s, a) => s + a.total, 0), [assetProjections]);
  const shortfall = Math.max(0, inflatedCorpus - totalProjected);
  const surplus = Math.max(0, totalProjected - inflatedCorpus);

  const readinessScore = useMemo(() => Math.min(100, Math.round((totalProjected / inflatedCorpus) * 100)), [totalProjected, inflatedCorpus]);

  const additionalSIP = useMemo(() => shortfall > 0 ? calcSIPFromCorpus(shortfall, 12, yearsToRetire) : 0, [shortfall, yearsToRetire]);

  const scoreColor = readinessScore >= 90 ? '#10b981' : readinessScore >= 70 ? '#f59e0b' : readinessScore >= 50 ? '#f97316' : '#ef4444';
  const scoreLabel = readinessScore >= 90 ? 'Excellent 🎉' : readinessScore >= 70 ? 'Good 👍' : readinessScore >= 50 ? 'Fair ⚠️' : 'Needs Attention 🚨';

  const updateNW = (key, val) => setNetWorth(prev => ({ ...prev, [key]: val }));
  const updateMonthly = (key, val) => setMonthly(prev => ({ ...prev, [key]: val }));

  const radialData = [{ name: 'Score', value: readinessScore, fill: scoreColor }];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Retirement Readiness Dashboard</h2>
        <p className="text-slate-500 mt-1">Multi-asset retirement projection with readiness score — like that WhatsApp bot, but way more powerful!</p>
      </div>

      {/* Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card md:col-span-1 flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Readiness Score</p>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="12"
                strokeDasharray={`${(readinessScore / 100) * 314} 314`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-black" style={{ color: scoreColor }}>{readinessScore}</p>
              <p className="text-xs text-slate-400">/ 100</p>
            </div>
          </div>
          <p className="text-sm font-bold mt-2" style={{ color: scoreColor }}>{scoreLabel}</p>
        </div>

        <div className="card md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Target (Inflation Adj.)</p>
              <p className="text-xl font-black text-slate-800 mt-1">{formatINR(inflatedCorpus)}</p>
              <p className="text-xs text-slate-400">from {formatINR(targetCorpus)} today</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Projected</p>
              <p className="text-xl font-black text-slate-800 mt-1">{formatINR(totalProjected)}</p>
              <p className="text-xs text-slate-400">from all assets</p>
            </div>
            {shortfall > 0 ? (
              <div className="col-span-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-500">Shortfall: {formatINR(shortfall)}</p>
                <p className="text-sm font-black text-red-700">Additional SIP needed: {formatINR(additionalSIP)}/mo at 12%</p>
              </div>
            ) : (
              <div className="col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-500">Surplus: {formatINR(surplus)}</p>
                <p className="text-sm font-black text-emerald-700">You're on track — great wealth building!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Inputs */}
      <div className="card mb-6">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">📊 Retirement Parameters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
          <SliderInput label="Current Age" value={currentAge} min={25} max={60} onChange={setCurrentAge} unit=" yrs" />
          <SliderInput label="Retirement Age" value={Math.max(currentAge + 1, retirementAge)} min={currentAge + 1} max={75} onChange={setRetirementAge} unit=" yrs" />
          <SliderInput label="Life Expectancy" value={lifeExpectancy} min={retirementAge + 1} max={100} onChange={setLifeExpectancy} unit=" yrs" />
          <SliderInput label="Target Corpus (Today)" value={targetCorpus} min={1000000} max={500000000} step={1000000} onChange={setTargetCorpus} prefix="₹" hint="In today's money — we'll inflate it" />
          <SliderInput label="Inflation" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} unit="%" />
        </div>
      </div>

      {/* Asset inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Net Worth */}
        <div className="card">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">💼 Current Net Worth by Asset</p>
          {Object.entries(ASSET_RATES).map(([key, info]) => (
            <div key={key} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-slate-600">{info.label}</span>
                <span className="text-xs text-slate-400">{info.defaultRate}% p.a.</span>
              </div>
              <input type="range" min={0} max={50000000} step={100000} value={netWorth[key] || 0} onChange={e => updateNW(key, +e.target.value)}
                className="w-full"
                style={{ background: `linear-gradient(to right, ${info.color} 0%, ${info.color} ${Math.min(100, (netWorth[key] || 0) / 500000)}%, #e2e8f0 ${Math.min(100, (netWorth[key] || 0) / 500000)}%, #e2e8f0 100%)` }} />
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-slate-400">₹0</span>
                <span className="font-bold" style={{ color: info.color }}>{formatINR(netWorth[key] || 0)}</span>
                <span className="text-slate-400">₹5Cr</span>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Investments */}
        <div className="card">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">📅 Monthly Investments by Asset</p>
          {Object.entries(ASSET_RATES).map(([key, info]) => (
            <div key={key} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-slate-600">{info.label}</span>
                <span className="text-xs font-bold" style={{ color: info.color }}>{formatINR(monthly[key] || 0)}/mo</span>
              </div>
              <input type="range" min={0} max={200000} step={5000} value={monthly[key] || 0} onChange={e => updateMonthly(key, +e.target.value)}
                className="w-full"
                style={{ background: `linear-gradient(to right, ${info.color} 0%, ${info.color} ${Math.min(100, (monthly[key] || 0) / 2000)}%, #e2e8f0 ${Math.min(100, (monthly[key] || 0) / 2000)}%, #e2e8f0 100%)` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Asset projection breakdown */}
      <div className="card mb-6">
        <h3 className="font-bold text-slate-700 mb-4">Projected Corpus by Asset Class</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-400">Asset</th>
                <th className="text-right py-2 text-slate-400">Today</th>
                <th className="text-right py-2 text-slate-400">NW → {retirementAge}</th>
                <th className="text-right py-2 text-slate-400">Monthly SIP</th>
                <th className="text-right py-2 text-slate-400">SIP → {retirementAge}</th>
                <th className="text-right py-2 text-orange-500 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {assetProjections.map(a => (
                <tr key={a.key} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: a.color }}></span>
                      <span className="font-semibold text-slate-700">{a.label}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-500">{formatINR(a.existingNW)}</td>
                  <td className="py-2 text-right font-semibold text-emerald-600">{formatINR(a.existingProjected)}</td>
                  <td className="py-2 text-right text-slate-500">{a.monthlyContrib > 0 ? `${formatINR(a.monthlyContrib)}/mo` : '-'}</td>
                  <td className="py-2 text-right font-semibold text-blue-600">{a.monthlyContrib > 0 ? formatINR(a.monthlyProjected) : '-'}</td>
                  <td className="py-2 text-right font-black text-orange-600">{formatINR(a.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 bg-orange-50">
                <td className="py-2 font-black text-slate-800">TOTAL</td>
                <td className="py-2 text-right font-bold">{formatINR(Object.values(netWorth).reduce((s, v) => s + v, 0))}</td>
                <td colSpan={3}></td>
                <td className="py-2 text-right font-black text-orange-700 text-base">{formatINR(totalProjected)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-4">Asset-wise Projected Corpus</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={assetProjections} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} />
            <Bar dataKey="existingProjected" name="NW Growth" stackId="a" radius={[0, 0, 0, 0]}>
              {assetProjections.map((a, i) => <Cell key={i} fill={a.color + 'aa'} />)}
            </Bar>
            <Bar dataKey="monthlyProjected" name="SIP Growth" stackId="a" radius={[4, 4, 0, 0]}>
              {assetProjections.map((a, i) => <Cell key={i} fill={a.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1"><span className="w-4 h-2 rounded inline-block bg-slate-300"></span> Existing NW Growth</span>
          <span className="flex items-center gap-1"><span className="w-4 h-2 rounded inline-block bg-orange-400"></span> Monthly SIP Growth</span>
        </div>
      </div>
    </div>
  );
}
