import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcRetirement, formatINR, calcSIPYearly } from '../../utils/financialCalc';

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(55);
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [preReturnRate, setPreReturnRate] = useState(12);
  const [postReturnRate, setPostReturnRate] = useState(8);
  const [currentSavings, setCurrentSavings] = useState(500000);

  const result = useMemo(() => calcRetirement({
    currentAge, retirementAge, lifeExpectancy,
    monthlyExpenses, inflation,
    preRetirementReturn: preReturnRate,
    postRetirementReturn: postReturnRate,
    currentSavings,
  }), [currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflation, preReturnRate, postReturnRate, currentSavings]);

  const yearsToRetire = retirementAge - currentAge;

  const growthData = useMemo(() => {
    const sipData = calcSIPYearly(result.sipNeeded, preReturnRate, yearsToRetire);
    return sipData.map((d, i) => ({
      year: currentAge + i + 1,
      corpus: d.corpus + currentSavings * Math.pow(1 + preReturnRate / 100, i + 1),
      target: result.corpusNeeded,
    }));
  }, [result, preReturnRate, yearsToRetire, currentAge, currentSavings]);

  const readyAge = useMemo(() => {
    const hit = growthData.find(d => d.corpus >= result.corpusNeeded);
    return hit ? hit.year : null;
  }, [growthData, result.corpusNeeded]);

  const fireNumber = result.monthlyExpensesAtRetirement * 12 / (postReturnRate / 100 - inflation / 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Retirement Planner</h2>
        <p className="text-slate-500 mt-1">How much do you need to retire comfortably?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-1">
          <p className="text-lg font-bold text-slate-700 mb-1">👤 Tell us about yourself</p>
          <SliderInput label="Your Current Age" value={currentAge} min={20} max={55} onChange={setCurrentAge} unit=" yrs" hint="How old are you today?" />
          <SliderInput label="Desired Retirement Age" value={Math.max(currentAge + 1, retirementAge)} min={currentAge + 1} max={70} onChange={setRetirementAge} unit=" yrs" hint="When do you want to stop working?" />
          <SliderInput label="Life Expectancy" value={Math.max(retirementAge + 5, lifeExpectancy)} min={retirementAge + 5} max={100} onChange={setLifeExpectancy} unit=" yrs" hint="Plan for a long healthy life!" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-4">💸 About your lifestyle</p>
          <SliderInput label="Current Monthly Expenses" value={monthlyExpenses} min={10000} max={500000} step={5000} onChange={setMonthlyExpenses} prefix="₹" hint="What you spend today per month" />
          <SliderInput label="Expected Inflation" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} unit="%" hint="India avg inflation: 6%" />
          <SliderInput label="Current Savings/Investments" value={currentSavings} min={0} max={10000000} step={50000} onChange={setCurrentSavings} prefix="₹" hint="Money already saved/invested" />

          <p className="text-lg font-bold text-slate-700 mb-1 mt-4">📊 Investment returns</p>
          <SliderInput label="Pre-Retirement Return" value={preReturnRate} min={6} max={18} step={0.5} onChange={setPreReturnRate} unit="%" hint="Expected return while accumulating" />
          <SliderInput label="Post-Retirement Return" value={postReturnRate} min={4} max={12} step={0.5} onChange={setPostReturnRate} unit="%" hint="Conservative return after retirement" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-rose-600 to-rose-700 text-white border-0">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Retirement Corpus Needed</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.corpusNeeded)}</p>
            <p className="text-sm opacity-75 mt-1">by age {retirementAge} ({yearsToRetire} years from now)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 bg-amber-50 border-amber-200">
              <p className="text-xs font-bold text-amber-600">Monthly Expenses at {retirementAge}</p>
              <p className="text-xl font-black text-amber-700 mt-1">{formatINR(result.monthlyExpensesAtRetirement)}</p>
              <p className="text-xs text-amber-500">Inflation-adjusted</p>
            </div>
            <div className="card p-4 bg-blue-50 border-blue-200">
              <p className="text-xs font-bold text-blue-600">Current Savings Growth</p>
              <p className="text-xl font-black text-blue-700 mt-1">{formatINR(result.growthOfCurrentSavings)}</p>
              <p className="text-xs text-blue-500">By retirement age</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <p className="text-sm font-semibold opacity-80">Monthly SIP Needed to Retire at {retirementAge}</p>
            <p className="text-4xl font-black mt-1">{formatINR(result.sipNeeded)}/mo</p>
            <p className="text-sm opacity-75 mt-1">at {preReturnRate}% return for {yearsToRetire} years</p>
          </div>

          <div className="card bg-gradient-to-br from-slate-50 to-blue-50 border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">📊 Retirement Summary</p>
            <div className="space-y-2">
              {[
                { label: `Working years left`, val: `${yearsToRetire} years` },
                { label: `Retirement duration`, val: `${lifeExpectancy - retirementAge} years` },
                { label: `Additional corpus needed`, val: formatINR(result.additionalCorpusNeeded) },
                { label: `FIRE number (current)`, val: formatINR(fireNumber) },
                readyAge && { label: `📅 Ready to retire by`, val: `Age ${readyAge}` },
              ].filter(Boolean).map(row => (
                <div key={row.label} className="flex justify-between items-center py-1 border-b border-blue-50">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className="text-sm font-bold text-slate-700">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">💡 Retirement Insights</p>
            <p className="text-sm text-amber-800 font-medium mb-1">
              📈 Retiring at {retirementAge} vs 60 = {60 - retirementAge > 0 ? `${60 - retirementAge} years` : 'same time'} early retirement
            </p>
            {result.sipNeeded < 20000 && <p className="text-sm text-amber-800 font-medium mb-1">✅ Very achievable SIP! Start today.</p>}
            {result.sipNeeded > 100000 && <p className="text-sm text-amber-800 font-medium mb-1">⚠️ High SIP needed — consider delaying retirement by 2-3 years.</p>}
          </div>
        </div>
      </div>

      {/* Corpus Build-Up Chart */}
      <div className="card mt-6">
        <div className="mb-4">
          <h3 className="font-bold text-slate-700">Corpus Build-Up Over Time</h3>
          <p className="text-xs text-slate-400">Projected wealth growth vs target retirement corpus</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={growthData.filter((_, i) => i % Math.max(1, Math.floor(yearsToRetire / 15)) === 0 || i === growthData.length - 1)} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Age ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} labelFormatter={l => `Age ${l}`} />
            <ReferenceLine y={result.corpusNeeded} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Target', fill: '#ef4444', fontSize: 11 }} />
            <Bar dataKey="corpus" name="Projected Corpus" radius={[4, 4, 0, 0]}>
              {growthData.filter((_, i) => i % Math.max(1, Math.floor(yearsToRetire / 15)) === 0 || i === growthData.length - 1).map((d, i) => (
                <Cell key={i} fill={d.corpus >= d.target ? '#10b981' : '#f97316'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 text-xs mt-2 justify-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block"></span> Building up</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span> Target reached</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-red-400 rounded inline-block"></span> Target corpus</span>
        </div>
      </div>
    </div>
  );
}
