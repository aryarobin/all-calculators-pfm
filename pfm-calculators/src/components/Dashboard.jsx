import { useState, useRef } from 'react';
import {
  TrendingUp, Coins, Rocket, Scale, Target, Palmtree, Gauge, Wallet,
  Percent, Sparkles, TrendingDown, CalendarClock, Home, Receipt,
  Briefcase, PieChart, Landmark, Search, ArrowRight, Zap, Flame,
} from 'lucide-react';
import { findCalculator, getSuggestions, EXAMPLE_QUERIES } from '../utils/smartRouter';
import InsightCards from './InsightCards';

const JOURNEYS = [
  {
    title: 'Build Wealth',
    desc: 'Put every rupee to work',
    accent: 'blue',
    grad: 'from-blue-500 to-indigo-600',
    tint: 'bg-blue-50 text-blue-600',
    hover: 'hover:border-blue-300 hover:bg-blue-50/50',
    steps: [
      { id: 'sip',     label: 'SIP Calculator',       desc: 'Monthly investment → corpus', Icon: TrendingUp },
      { id: 'lumpsum', label: 'Lumpsum',               desc: 'One-time investment growth', Icon: Coins },
      { id: 'stepup',  label: 'Step-Up SIP',           desc: 'Raise SIP every year', Icon: Rocket },
      { id: 'compare', label: 'Compare Instruments',   desc: 'FD vs PPF vs MF vs NPS', Icon: Scale },
    ],
  },
  {
    title: 'Plan for Goals',
    desc: 'Work backwards from the target',
    accent: 'violet',
    grad: 'from-violet-500 to-purple-600',
    tint: 'bg-violet-50 text-violet-600',
    hover: 'hover:border-violet-300 hover:bg-violet-50/50',
    steps: [
      { id: 'fire',       label: 'Financial Freedom',    desc: 'Retire-now corpus, after tax', Icon: Flame },
      { id: 'retirement', label: 'Retirement',           desc: 'Corpus & SIP to retire', Icon: Palmtree },
      { id: 'goal',       label: 'Goal Planner',         desc: 'Inflation-adjusted SIP', Icon: Target },
      { id: 'swp',        label: 'Income & Withdrawal',  desc: 'Income from your corpus', Icon: Wallet },
      { id: 'readiness',  label: 'Readiness Score',      desc: 'Multi-asset readiness', Icon: Gauge },
    ],
  },
  {
    title: 'Smart Decisions',
    desc: 'The big "should I…?" questions',
    accent: 'cyan',
    grad: 'from-cyan-500 to-blue-600',
    tint: 'bg-cyan-50 text-cyan-600',
    hover: 'hover:border-cyan-300 hover:bg-cyan-50/50',
    steps: [
      { id: 'prepay',  label: 'Prepay vs Invest', desc: 'Clear the loan or invest?', Icon: Scale },
      { id: 'rentbuy', label: 'Rent vs Buy',       desc: 'Which builds more wealth?', Icon: Home },
      { id: 'xirr',    label: 'XIRR Calculator',   desc: 'Your real SIP return', Icon: Percent },
      { id: 'coast',   label: 'Coast FIRE',        desc: 'When can you stop?', Icon: Flame },
    ],
  },
  {
    title: 'Understand Returns',
    desc: 'What are you really earning?',
    accent: 'emerald',
    grad: 'from-emerald-500 to-teal-600',
    tint: 'bg-emerald-50 text-emerald-600',
    hover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    steps: [
      { id: 'cagr',       label: 'CAGR Calculator',  desc: 'True annualised return', Icon: Percent },
      { id: 'multiplier', label: 'Money Multiplier', desc: '2× / 5× / 10× timing', Icon: Sparkles },
      { id: 'inflation',  label: 'Inflation Impact', desc: 'Future cost & real returns', Icon: TrendingDown },
      { id: 'timeline',   label: 'Financial Timeline', desc: 'Your whole life on one view', Icon: CalendarClock },
    ],
  },
  {
    title: 'Loans, Tax & Salary',
    desc: 'Know exactly where you stand',
    accent: 'amber',
    grad: 'from-amber-500 to-orange-600',
    tint: 'bg-amber-50 text-amber-600',
    hover: 'hover:border-amber-300 hover:bg-amber-50/50',
    steps: [
      { id: 'emi',    label: 'EMI Calculator', desc: 'Home / car / personal', Icon: Home },
      { id: 'tax',    label: 'Income Tax',     desc: 'New vs Old regime', Icon: Receipt },
      { id: 'salary', label: 'CTC & Salary',   desc: 'In-hand, HRA, gratuity', Icon: Briefcase },
      { id: 'budget', label: 'Budget Planner', desc: '50/30/20 allocation', Icon: PieChart },
    ],
  },
];

// Quick "popular" gradient cards
const POPULAR = [
  { id: 'sip', label: 'SIP', grad: 'from-blue-500 to-indigo-600', Icon: TrendingUp },
  { id: 'retirement', label: 'Retirement', grad: 'from-violet-500 to-purple-600', Icon: Palmtree },
  { id: 'emi', label: 'EMI', grad: 'from-amber-500 to-orange-600', Icon: Home },
  { id: 'tax', label: 'Income Tax', grad: 'from-rose-500 to-red-600', Icon: Receipt },
  { id: 'readiness', label: 'Readiness', grad: 'from-emerald-500 to-teal-600', Icon: Gauge },
  { id: 'fdppf', label: 'FD / PPF', grad: 'from-cyan-500 to-blue-600', Icon: Landmark },
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
    if (!r) setSuggestions(getSuggestions(q)); else setSuggestions([]);
  };

  const handleGo = () => {
    if (result) { onSelect(result.id); setQuery(''); setResult(null); }
  };

  const handleExample = (ex) => {
    setQuery(ex);
    setResult(findCalculator(ex));
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Hero banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#11161F] via-indigo-900 to-violet-900 text-white p-6 sm:p-10 mb-6">
        <div className="pointer-events-none absolute -top-12 -right-10 w-60 h-60 rounded-full bg-[#5EE5E5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-[11px] font-semibold mb-4">
            <Zap size={12} className="fill-[#5EE5E5] text-[#5EE5E5]" /> India's most complete money toolkit · free
          </div>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Make every rupee<br /> decision with <span className="text-[#5EE5E5]">confidence</span>.
          </h1>
          <p className="text-white/65 text-sm sm:text-base mt-4 max-w-xl leading-relaxed">
            22 calculators with live charts — SIP, retirement, FIRE, EMI, rent-vs-buy, prepay-vs-invest and more. Ask a question in plain English, or pick a tool. Answers update as you move the sliders.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onSelect('sip')}
              className="inline-flex items-center gap-2 bg-[#5EE5E5] hover:bg-[#3DD6D6] text-[#11161F] font-bold text-sm px-5 py-3 rounded-xl transition-colors">
              Explore calculators <ArrowRight size={16} />
            </button>
            <a href="https://app.goalfi.app/signup" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors">
              Invest with GoalFi
            </a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8 mt-7 pt-6 border-t border-white/10">
            {[['22', 'Calculators'], ['100%', 'Free & live'], ['🇮🇳', 'Built for India'], ['0', 'Sign-up needed']].map(([n, l]) => (
              <div key={l}>
                <p className="text-lg sm:text-xl font-black">{n}</p>
                <p className="text-[10px] sm:text-[11px] text-white/55 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conversational insight cards ─────────────────────────────── */}
      <InsightCards onSelect={onSelect} />

      {/* ── Smart search ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                placeholder='Ask: "How much to retire at 55?"'
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {result && (
              <button onClick={handleGo}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 sm:px-5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5">
                Open <ArrowRight size={15} />
              </button>
            )}
          </div>

          {result && (
            <div className="mt-2.5 flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${result.confidence === 'high' ? 'bg-emerald-500' : result.confidence === 'medium' ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <p className="text-sm text-blue-800 font-medium flex-1">{result.message}</p>
            </div>
          )}

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

          {!result && query.trim().length > 3 && suggestions.length === 0 && (
            <p className="mt-2 text-xs text-slate-400 px-1">
              No match — try "retire at 55", "home loan EMI", or "income tax new regime"
            </p>
          )}
        </div>

        <div className="px-4 sm:px-5 pb-4 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUERIES.slice(0, 6).map(ex => (
              <button key={ex} onClick={() => handleExample(ex)}
                className="text-[12px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all">
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular gradient cards ───────────────────────────────────── */}
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Most used</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-6">
        {POPULAR.map(({ id, label, grad, Icon }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-3 text-white text-left transition-transform active:scale-95 hover:shadow-lg`}>
            <div className="pointer-events-none absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/15 blur-xl" />
            <Icon size={20} className="mb-6 relative" strokeWidth={2.2} />
            <p className="text-xs font-bold leading-tight relative">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Journey sections ─────────────────────────────────────────── */}
      <div className="space-y-5">
        {JOURNEYS.map(journey => (
          <div key={journey.title}>
            <div className="flex items-center gap-2.5 mb-2.5 px-1">
              <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${journey.grad}`} />
              <div>
                <h2 className="text-sm font-bold text-slate-800 leading-tight">{journey.title}</h2>
                <p className="text-xs text-slate-400 leading-tight">{journey.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {journey.steps.map(({ id, label, desc, Icon }) => (
                <button key={id} onClick={() => onSelect(id)}
                  className={`bg-white rounded-2xl border border-slate-200 p-3.5 text-left transition-all ${journey.hover} hover:shadow-sm group`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${journey.tint}`}>
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight">{label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Safe savings — full-width gradient feature card */}
        <button onClick={() => onSelect('fdppf')}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white text-left transition-transform active:scale-[0.99] hover:shadow-lg flex items-center gap-4">
          <div className="pointer-events-none absolute -top-8 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 relative">
            <Landmark size={24} strokeWidth={2.2} />
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="text-base font-black leading-tight">Safe Savings — FD, RD, PPF, NPS</p>
            <p className="text-xs text-white/70 mt-0.5">Compare maturity across all guaranteed, tax-advantaged instruments</p>
          </div>
          <ArrowRight size={20} className="relative flex-shrink-0" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        All calculations are estimates. Consult a SEBI-registered investment advisor before investing.
      </p>
    </div>
  );
}
