import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcSIP, calcFD, calcPPF, calcNPS, calcLumpsum, formatINR, formatPercent } from '../../utils/financialCalc';

const INSTRUMENTS = [
  { id: 'equity_sip', label: '📈 Equity MF SIP', color: '#f97316', defaultReturn: 12, type: 'sip', taxType: 'ltcg', ltcgExemption: 125000, ltcgRate: 12.5, risk: 'High', lockIn: 0 },
  { id: 'elss', label: '🧾 ELSS SIP', color: '#7c3aed', defaultReturn: 12, type: 'sip', taxType: 'ltcg', ltcgExemption: 125000, ltcgRate: 10, risk: 'High', lockIn: 3, taxSaving: 46800 },
  { id: 'ppf', label: '🛡️ PPF', color: '#10b981', defaultReturn: 7.1, type: 'ppf', taxType: 'exempt', risk: 'None', lockIn: 15 },
  { id: 'fd', label: '🏦 Bank FD', color: '#3b82f6', defaultReturn: 7, type: 'fd', taxType: 'slab', risk: 'None', lockIn: 0 },
  { id: 'nps', label: '🏛️ NPS', color: '#6366f1', defaultReturn: 10, type: 'nps', taxType: 'partial', risk: 'Med', lockIn: -1, taxSaving: 77000 },
  { id: 'gold', label: '🪙 Gold', color: '#f59e0b', defaultReturn: 8, type: 'lumpsum', taxType: 'ltcg', ltcgRate: 20, risk: 'Med', lockIn: 0 },
];

export default function InvestmentComparison() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(15);
  const [taxSlab, setTaxSlab] = useState(30);
  const [selected, setSelected] = useState(new Set(['equity_sip', 'ppf', 'fd', 'elss']));

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) { if (s.size > 1) s.delete(id); }
    else s.add(id);
    setSelected(s);
  };

  const calcCorpus = (inst, rate) => {
    if (inst.type === 'sip') return calcSIP(monthly, rate, years).corpus;
    if (inst.type === 'ppf') return calcPPF(monthly * 12, years, rate).maturity;
    if (inst.type === 'fd') return calcFD(monthly * 12, rate, years).maturity;
    if (inst.type === 'nps') return calcNPS(monthly, years, rate).corpus;
    return calcLumpsum(monthly * 12, rate, years).corpus;
  };

  const calcPostTax = (inst, corpus, invested) => {
    const gains = corpus - invested;
    if (inst.taxType === 'exempt') return corpus;
    if (inst.taxType === 'ltcg') {
      const taxableGains = Math.max(0, gains - (inst.ltcgExemption || 0));
      return corpus - taxableGains * (inst.ltcgRate || 12.5) / 100;
    }
    if (inst.taxType === 'slab') return corpus - gains * taxSlab / 100;
    if (inst.taxType === 'partial') return corpus * 0.8; // NPS: 40% annuity
    return corpus;
  };

  const results = useMemo(() => INSTRUMENTS.map(inst => {
    const corpus = calcCorpus(inst, inst.defaultReturn);
    const invested = monthly * 12 * years;
    const postTax = calcPostTax(inst, corpus, invested);
    const taxSaved = inst.taxSaving ? inst.taxSaving * Math.min(years, 15) : 0;
    return {
      ...inst,
      corpus,
      invested,
      gains: corpus - invested,
      postTax,
      netPostTax: postTax + taxSaved,
      annualReturn: inst.defaultReturn,
    };
  }), [monthly, years, taxSlab]);

  // Chart data (yearly)
  const chartData = useMemo(() => {
    const activeInstruments = results.filter(r => selected.has(r.id));
    return Array.from({ length: years }, (_, i) => {
      const yr = i + 1;
      const row = { year: yr };
      activeInstruments.forEach(inst => {
        const c = calcCorpus(inst, inst.defaultReturn);
        row[inst.label] = Math.round(
          inst.type === 'sip' ? calcSIP(monthly, inst.defaultReturn, yr).corpus :
          inst.type === 'ppf' ? calcPPF(monthly * 12, yr, inst.defaultReturn).maturity :
          inst.type === 'fd' ? calcFD(monthly * 12, inst.defaultReturn, yr).maturity :
          calcSIP(monthly, inst.defaultReturn, yr).corpus
        );
      });
      return row;
    });
  }, [results, selected, monthly, years]);

  const activeResults = results.filter(r => selected.has(r.id));
  const bestPreTax = [...activeResults].sort((a, b) => b.corpus - a.corpus)[0];
  const bestPostTax = [...activeResults].sort((a, b) => b.netPostTax - a.netPostTax)[0];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Investment Comparison</h2>
        <p className="text-slate-500 mt-1">FD vs PPF vs ELSS vs NPS — same money, radically different outcomes!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Inputs</p>
          <SliderInput label="Monthly Investment" value={monthly} min={1000} max={100000} step={1000} onChange={setMonthly} prefix="₹" />
          <SliderInput label="Duration" value={years} min={3} max={30} onChange={setYears} unit=" yrs" />
          <SliderInput label="Your Tax Slab" value={taxSlab} min={0} max={30} step={5} onChange={setTaxSlab} unit="%" hint="For FD interest tax calculation" />

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-4">Select Instruments to Compare</p>
          <div className="space-y-2">
            {INSTRUMENTS.map(inst => (
              <button key={inst.id} onClick={() => toggle(inst.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selected.has(inst.id) ? 'border-2 bg-opacity-10' : 'border-slate-100 opacity-60'}`}
                style={{ borderColor: selected.has(inst.id) ? inst.color : undefined, background: selected.has(inst.id) ? inst.color + '12' : undefined }}>
                <span className="text-sm font-semibold text-slate-700">{inst.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${inst.risk === 'None' ? 'bg-green-100 text-green-700' : inst.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inst.risk}
                  </span>
                  <span className="text-xs font-bold" style={{ color: inst.color }}>{inst.defaultReturn}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Winner callout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Best Pre-Tax Returns</p>
              <p className="text-lg font-black mt-1">{bestPreTax?.label}</p>
              <p className="text-2xl font-black">{formatINR(bestPreTax?.corpus)}</p>
            </div>
            <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Best Post-Tax Returns</p>
              <p className="text-lg font-black mt-1">{bestPostTax?.label}</p>
              <p className="text-2xl font-black">{formatINR(bestPostTax?.netPostTax)}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="card">
            <p className="text-sm font-bold text-slate-600 mb-3">Corpus Comparison ({years} years)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeResults} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={60} />
                <Tooltip formatter={(v, n) => [formatINR(v), n]} />
                <Bar dataKey="corpus" name="Pre-Tax Corpus" radius={[4, 4, 0, 0]}>
                  {activeResults.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed table */}
          <div className="card overflow-x-auto">
            <p className="text-sm font-bold text-slate-600 mb-3">Detailed Comparison</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-400">Instrument</th>
                  <th className="text-right py-2 text-slate-400">Return</th>
                  <th className="text-right py-2 text-slate-400">Pre-Tax</th>
                  <th className="text-right py-2 text-slate-400">Post-Tax</th>
                  <th className="text-right py-2 text-slate-400">Risk</th>
                </tr>
              </thead>
              <tbody>
                {activeResults.sort((a, b) => b.netPostTax - a.netPostTax).map((r, i) => (
                  <tr key={r.id} className={`border-b border-slate-50 ${i === 0 ? 'bg-emerald-50' : ''}`}>
                    <td className="py-2">
                      <span className="font-semibold text-slate-700">{r.label}</span>
                      {i === 0 && <span className="ml-1 text-xs text-emerald-600 font-bold">BEST</span>}
                    </td>
                    <td className="py-2 text-right font-bold" style={{ color: r.color }}>{r.defaultReturn}%</td>
                    <td className="py-2 text-right text-slate-600">{formatINR(r.corpus)}</td>
                    <td className="py-2 text-right font-bold text-emerald-600">{formatINR(r.netPostTax)}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${r.risk === 'None' ? 'bg-green-100 text-green-700' : r.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Growth chart */}
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-4">Growth Comparison Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={v => `Yr ${v}`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatINR(v, true)} width={70} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} />
            <Legend iconType="circle" iconSize={8} />
            {activeResults.map(inst => (
              <Line key={inst.id} type="monotone" dataKey={inst.label} stroke={inst.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
