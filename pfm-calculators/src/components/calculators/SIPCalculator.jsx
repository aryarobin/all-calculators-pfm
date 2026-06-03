import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcSIPYearly, formatINR, formatPercent, calcSIP } from '../../utils/financialCalc';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);

  const data = useMemo(() => calcSIPYearly(monthly, rate, years), [monthly, rate, years]);
  const result = data[data.length - 1] || { corpus: 0, invested: 0, gains: 0 };

  const wealthMultiple = result.invested > 0 ? (result.corpus / result.invested).toFixed(1) : 1;
  const extraAtRetirement = useMemo(() => {
    const with500 = calcSIP(monthly + 500, rate, years);
    return with500.corpus - result.corpus;
  }, [monthly, rate, years, result.corpus]);

  const yearToDouble = useMemo(() => {
    const target = monthly * 12 * 2;
    const idx = data.findIndex(d => d.corpus >= target);
    return idx >= 0 ? idx + 1 : null;
  }, [data, monthly]);

  const insights = useMemo(() => {
    const msgs = [];
    if (wealthMultiple >= 3) msgs.push(`💎 Your money grows ${wealthMultiple}x — every ₹1 becomes ₹${wealthMultiple}!`);
    if (extraAtRetirement > 0) msgs.push(`🚀 Just ₹500 more/month = ${formatINR(extraAtRetirement)} extra!`);
    if (result.gains > result.invested) msgs.push(`🎯 Returns (${formatINR(result.gains)}) beat your investment (${formatINR(result.invested)})!`);
    return msgs;
  }, [wealthMultiple, extraAtRetirement, result]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">SIP Calculator</h2>
        <p className="text-slate-500 mt-1">How much will your monthly SIP grow to?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="card">
          <div className="mb-6">
            <p className="text-lg font-bold text-slate-700 mb-1">📅 How much can you invest every month?</p>
            <p className="text-sm text-slate-400">Even ₹500/month can build real wealth over time.</p>
          </div>
          <SliderInput label="Monthly SIP Amount" value={monthly} min={500} max={100000} step={500} onChange={setMonthly} prefix="₹" hint="Your regular monthly investment" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">📈 What annual return do you expect?</p>
          <p className="text-sm text-slate-400 mb-4">Equity MF avg: 12%, Debt MF: 7%, FD: 6.5%</p>
          <SliderInput label="Expected Annual Return" value={rate} min={4} max={20} step={0.5} onChange={setRate} unit="%" hint="Historical equity MF average is 12%" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-2">⏰ For how many years?</p>
          <p className="text-sm text-slate-400 mb-4">Time is your biggest wealth multiplier.</p>
          <SliderInput label="Investment Duration" value={years} min={1} max={40} onChange={setYears} unit=" yrs" hint="Longer = exponentially more wealth" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Total Corpus</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.corpus)}</p>
            <p className="text-sm opacity-75 mt-1">in {years} years</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">You Invested</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(result.invested)}</p>
              <p className="text-xs text-emerald-500 mt-1">Total deposits</p>
            </div>
            <div className="card bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">Wealth Gained</p>
              <p className="text-2xl font-black text-violet-700 mt-1">{formatINR(result.gains)}</p>
              <p className="text-xs text-violet-500 mt-1">Pure returns</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center p-3 bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-500 font-bold">Wealth Multiple</p>
              <p className="text-xl font-black text-blue-700">{wealthMultiple}x</p>
            </div>
            <div className="card text-center p-3 bg-amber-50 border-amber-100">
              <p className="text-xs text-amber-500 font-bold">Gains Share</p>
              <p className="text-xl font-black text-amber-700">{result.corpus > 0 ? Math.round(result.gains / result.corpus * 100) : 0}%</p>
            </div>
            <div className="card text-center p-3 bg-rose-50 border-rose-100">
              <p className="text-xs text-rose-500 font-bold">Monthly ROI</p>
              <p className="text-xl font-black text-rose-700">{formatPercent(rate / 12, 2)}</p>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Key Insights</p>
              {insights.map((ins, i) => (
                <p key={i} className="text-sm text-amber-800 font-medium mb-1">{ins}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-700">Your Wealth Journey</h3>
            <p className="text-xs text-slate-400">Watch the magic of compounding unfold year by year</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span> Total Corpus</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span> Invested</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="corpus" name="Total Corpus" stroke="#f97316" strokeWidth={2.5} fill="url(#corpusGrad)" />
            <Area type="monotone" dataKey="invested" name="Invested" stroke="#10b981" strokeWidth={2} fill="url(#investedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Breakdown */}
      <div className="card mt-6">
        <h3 className="font-bold text-slate-700 mb-4">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-400 font-semibold">Year</th>
                <th className="text-right py-2 text-slate-400 font-semibold">Invested</th>
                <th className="text-right py-2 text-slate-400 font-semibold">Returns</th>
                <th className="text-right py-2 text-slate-400 font-semibold">Total Corpus</th>
                <th className="text-right py-2 text-slate-400 font-semibold">Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.filter((_, i) => i % Math.max(1, Math.floor(years / 10)) === 0 || i === data.length - 1).map(row => (
                <tr key={row.year} className={`border-b border-slate-50 hover:bg-orange-50 transition-colors ${row.year === years ? 'bg-orange-50 font-bold' : ''}`}>
                  <td className="py-2 text-slate-600">Yr {row.year}</td>
                  <td className="py-2 text-right text-slate-600">{formatINR(row.invested)}</td>
                  <td className="py-2 text-right text-emerald-600">{formatINR(row.gains)}</td>
                  <td className="py-2 text-right text-orange-600 font-semibold">{formatINR(row.corpus)}</td>
                  <td className="py-2 text-right text-violet-600">{row.invested > 0 ? `${((row.corpus / row.invested)).toFixed(1)}x` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
