import { useState } from 'react';
import { findCalculator, EXAMPLE_QUERIES } from '../utils/smartRouter';

const JOURNEYS = [
  {
    title: 'Build Wealth',
    desc: 'SIP, lumpsum, step-up — put every rupee to work',
    steps: [
      { id: 'sip', label: 'SIP Calculator', desc: 'Monthly investment → final corpus' },
      { id: 'lumpsum', label: 'Lumpsum', desc: 'One-time investment projection' },
      { id: 'stepup', label: 'Step-Up SIP', desc: 'Increase SIP yearly — see the difference' },
      { id: 'compare', label: 'Instrument Comparison', desc: 'FD vs PPF vs Equity MF vs NPS' },
    ],
  },
  {
    title: 'Plan for Goals',
    desc: 'Retirement, home, education, wedding — work backwards from the target',
    steps: [
      { id: 'goal', label: 'Goal Planner', desc: 'Any goal, inflation-adjusted SIP needed' },
      { id: 'retirement', label: 'Retirement Calculator', desc: 'Corpus needed, SIP to get there' },
      { id: 'readiness', label: 'Readiness Dashboard', desc: 'Multi-asset retirement readiness score' },
      { id: 'swp', label: 'Withdrawal Plan', desc: 'Monthly income from corpus' },
    ],
  },
  {
    title: 'Understand Returns',
    desc: 'Is your investment performing? What are you actually earning after inflation?',
    steps: [
      { id: 'cagr', label: 'CAGR Calculator', desc: 'Find true annualised return' },
      { id: 'multiplier', label: 'Money Multiplier', desc: '2× / 5× / 10× — when and at what rate' },
      { id: 'inflation', label: 'Inflation Calculator', desc: "Future cost, real returns, purchasing power" },
    ],
  },
  {
    title: 'Loans, Tax & Salary',
    desc: 'EMI, tax regime, CTC breakdown — know exactly where you stand',
    steps: [
      { id: 'emi', label: 'EMI Calculator', desc: 'Home / car / personal loan — full schedule' },
      { id: 'tax', label: 'Income Tax', desc: 'New vs Old regime — which saves more' },
      { id: 'salary', label: 'CTC Breakdown', desc: 'In-hand salary, HRA exemption, gratuity' },
      { id: 'budget', label: 'Budget Planner', desc: '50/30/20 allocation planner' },
    ],
  },
];

export default function Dashboard({ onSelect }) {
  const [query, setQuery] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [showAllExamples, setShowAllExamples] = useState(false);

  const handleSearch = (q) => {
    setQuery(q);
    if (!q.trim()) { setRouteResult(null); return; }
    const result = findCalculator(q);
    setRouteResult(result);
  };

  const handleGo = () => {
    if (routeResult) onSelect(routeResult.id);
  };

  const displayedExamples = showAllExamples ? EXAMPLE_QUERIES : EXAMPLE_QUERIES.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Smart search */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Personal Finance Calculators</h1>
        <p className="text-slate-500 text-sm mb-5">Ask a question or pick a journey below — everything updates in real time as you adjust sliders.</p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ask anything</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                placeholder='e.g. "How much SIP for ₹1 crore in 10 years?"'
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {routeResult && (
                <button onClick={handleGo} className="btn-primary px-5">
                  Go →
                </button>
              )}
            </div>

            {/* Route result */}
            {routeResult && (
              <div className="mt-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                <p className="text-sm text-blue-800 font-medium">{routeResult.message}</p>
              </div>
            )}

            {/* Examples */}
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-2">Try:</p>
              <div className="flex flex-wrap gap-1.5">
                {displayedExamples.map(ex => (
                  <button key={ex} onClick={() => handleSearch(ex)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-all">
                    {ex}
                  </button>
                ))}
                <button onClick={() => setShowAllExamples(!showAllExamples)} className="text-xs px-2.5 py-1 text-blue-600 hover:underline">
                  {showAllExamples ? 'show less' : `+${EXAMPLE_QUERIES.length - 5} more`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey blocks */}
      <div className="space-y-3">
        {JOURNEYS.map(journey => (
          <div key={journey.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800">{journey.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{journey.desc}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
              {journey.steps.map((step, i) => (
                <button key={step.id} onClick={() => onSelect(step.id)}
                  className="p-4 text-left hover:bg-blue-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{step.label}</p>
                    {i === 0 && <span className="text-xs font-semibold text-blue-600 ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{step.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Savings row */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-800">Safe Savings Instruments</h2>
            <p className="text-xs text-slate-500 mt-0.5">FD, RD, PPF, NPS — guaranteed and tax-advantaged returns</p>
          </div>
          <button onClick={() => onSelect('fdppf')} className="w-full p-4 text-left hover:bg-blue-50 transition-colors group">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">FD / RD / PPF / NPS Calculator →</p>
            <p className="text-xs text-slate-400 mt-1">Compare maturity amounts across all safe investment instruments</p>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        All calculations are estimates based on standard financial formulas. Consult a SEBI-registered advisor before investing.
      </p>
    </div>
  );
}
