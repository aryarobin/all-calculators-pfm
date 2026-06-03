import { useState, useRef } from 'react';
import { findCalculator, getSuggestions, EXAMPLE_QUERIES } from '../utils/smartRouter';

const JOURNEYS = [
  {
    title: 'Build Wealth',
    desc: 'SIP, lumpsum, step-up — put every rupee to work',
    steps: [
      { id: 'sip',     label: 'SIP Calculator',       desc: 'Monthly investment → final corpus' },
      { id: 'lumpsum', label: 'Lumpsum',               desc: 'One-time investment projection' },
      { id: 'stepup',  label: 'Step-Up SIP',           desc: 'Increase SIP yearly — see the difference' },
      { id: 'compare', label: 'Instrument Comparison', desc: 'FD vs PPF vs Equity MF vs NPS' },
    ],
  },
  {
    title: 'Plan for Goals',
    desc: 'Retirement, home, education, wedding — work backwards from the target',
    steps: [
      { id: 'goal',       label: 'Goal Planner',          desc: 'Any goal, inflation-adjusted SIP' },
      { id: 'retirement', label: 'Retirement Calculator',  desc: 'Corpus needed, SIP to get there' },
      { id: 'readiness',  label: 'Readiness Dashboard',   desc: 'Multi-asset readiness score' },
      { id: 'swp',        label: 'Withdrawal Plan',       desc: 'Monthly income from corpus' },
    ],
  },
  {
    title: 'Understand Returns',
    desc: 'Is your investment performing? What are you actually earning after inflation?',
    steps: [
      { id: 'cagr',       label: 'CAGR Calculator',    desc: 'Find true annualised return' },
      { id: 'multiplier', label: 'Money Multiplier',   desc: '2× / 5× / 10× — when and at what rate' },
      { id: 'inflation',  label: 'Inflation Impact',   desc: "Future costs and purchasing power" },
      { id: 'timeline',   label: 'Financial Timeline', desc: 'Your whole financial life on one view' },
    ],
  },
  {
    title: 'Loans, Tax & Salary',
    desc: 'EMI, tax regime, CTC breakdown — know exactly where you stand',
    steps: [
      { id: 'emi',    label: 'EMI Calculator', desc: 'Home / car / personal — full schedule' },
      { id: 'tax',    label: 'Income Tax',     desc: 'New vs Old regime — which saves more' },
      { id: 'salary', label: 'CTC Breakdown',  desc: 'In-hand salary, HRA exemption, gratuity' },
      { id: 'budget', label: 'Budget Planner', desc: '50/30/20 allocation planner' },
    ],
  },
];

export default function Dashboard({ onSelect }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const handleChange = (q) => {
    setQuery(q);
    if (!q.trim()) { setResult(null); setSuggestions([]); return; }
    const r = findCalculator(q);
    setResult(r);
    if (!r) setSuggestions(getSuggestions(q));
    else setSuggestions([]);
  };

  const handleGo = () => {
    if (result) { onSelect(result.id); setQuery(''); setResult(null); }
  };

  const handleExample = (ex) => {
    setQuery(ex);
    const r = findCalculator(ex);
    setResult(r);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Finance Calculators</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask a question in plain English, or browse the tools below. All calculations update live as you move sliders.
        </p>
      </div>

      {/* Smart search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 pt-4 pb-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ask anything</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGo()}
              placeholder='e.g. "How much do I need to retire at 55?" or "EMI for ₹50L home loan"'
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {result && (
              <button onClick={handleGo}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Open →
              </button>
            )}
          </div>

          {/* Match result */}
          {result && (
            <div className="mt-2.5 flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${result.confidence === 'high' ? 'bg-emerald-500' : result.confidence === 'medium' ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <p className="text-sm text-blue-800 font-medium flex-1">{result.message}</p>
            </div>
          )}

          {/* No match suggestions */}
          {!result && query.trim().length > 2 && suggestions.length > 0 && (
            <div className="mt-2.5 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Did you mean?</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s.id} onClick={() => onSelect(s.id)}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No match at all */}
          {!result && query.trim().length > 3 && suggestions.length === 0 && (
            <p className="mt-2 text-xs text-slate-400 px-1">
              No match — try phrases like "retire at 55", "home loan EMI", or "income tax new regime"
            </p>
          )}
        </div>

        {/* Example queries */}
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Try these</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUERIES.map(ex => (
              <button key={ex} onClick={() => handleExample(ex)}
                className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all">
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Journey blocks */}
      <div className="space-y-2.5">
        {JOURNEYS.map(journey => (
          <div key={journey.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-800">{journey.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{journey.desc}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
              {journey.steps.map((step, i) => (
                <button key={step.id} onClick={() => onSelect(step.id)}
                  className="p-4 text-left hover:bg-blue-50 transition-colors group">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 leading-tight">
                    {step.label}
                    {i === 0 && <span className="ml-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full align-middle hidden sm:inline">Start</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{step.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Savings row */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-800">Safe Savings Instruments</h2>
            <p className="text-xs text-slate-400 mt-0.5">FD, RD, PPF, NPS — guaranteed and tax-advantaged returns</p>
          </div>
          <button onClick={() => onSelect('fdppf')} className="w-full p-4 text-left hover:bg-blue-50 transition-colors group">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">FD / RD / PPF / NPS Calculator</p>
            <p className="text-xs text-slate-400 mt-1">Compare maturity amounts across all safe investment instruments</p>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        All calculations are estimates. Consult a SEBI-registered investment advisor before investing.
      </p>
    </div>
  );
}
