import { useState, useRef } from 'react';
import {
  TrendingUp, Coins, Rocket, Scale, Target, Palmtree, Gauge, Wallet,
  Percent, Sparkles, TrendingDown, CalendarClock, Home, Receipt,
  Briefcase, PieChart, Landmark, Search, ArrowRight, Flame,
  Gem, Hourglass, PiggyBank, Shield, Umbrella, HeartPulse, Shuffle,
  LineChart, Trophy, Clock, Banknote, CreditCard, Baby, Calculator,
  Building2,
} from 'lucide-react';
import { findCalculator, getSuggestions, EXAMPLE_QUERIES } from '../utils/smartRouter';
import { CALCULATORS, NAV_GROUP_ORDER, GOALFI_URL } from '../calculators';
import InsightCards from './InsightCards';
import JourneyRail from './JourneyRail';

// One icon + a short human tagline per calculator id. The cards themselves
// are generated from the registry so this page always reflects everything built.
const META = {
  sip:            [TrendingUp,    'Monthly investment → corpus'],
  lumpsum:        [Coins,         'One-time investment growth'],
  stepup:         [Rocket,        'Raise your SIP every year'],
  compare:        [Scale,         'FD vs PPF vs MF vs NPS'],
  gold:           [Gem,           'SGB vs ETF vs physical'],

  goal:           [Target,        'Inflation-adjusted SIP'],
  retirement:     [Palmtree,      'Corpus & SIP to retire'],
  readiness:      [Gauge,         'Multi-asset readiness score'],
  swp:            [Wallet,        'Income from your corpus'],
  fire:           [Flame,         'Retire-now corpus, after tax'],
  coast:          [Hourglass,     'When can you stop investing?'],
  epfnpsvpf:      [PiggyBank,     'Best retirement scheme'],
  emergency:      [Shield,        'How many months saved?'],

  prepay:         [Scale,         'Clear the loan or invest?'],
  rentbuy:        [Home,          'Which builds more wealth?'],
  insurevsinvest: [Shuffle,       'Term + invest vs ULIP'],
  lumpvssip:      [Shuffle,       'Deploy a windfall'],
  directregular:  [Percent,       'The commission you lose'],
  termcover:      [Umbrella,      'Life cover you need'],
  healthcover:    [HeartPulse,    'Health cover you need'],

  xirr:           [Percent,       'Your real SIP return'],
  timeline:       [CalendarClock, 'Your life on one view'],
  cagr:           [LineChart,     'True annualised return'],
  multiplier:     [Sparkles,      '2× / 5× / 10× timing'],
  inflation:      [TrendingDown,  'Future cost & real returns'],
  simplecompound: [TrendingUp,    'Why compounding wins'],
  networth:       [PieChart,      'Assets minus liabilities'],
  crorepati:      [Trophy,        'When you hit ₹1 crore'],
  costofdelay:    [Clock,         'The price of waiting'],
  realreturn:     [TrendingDown,  'After tax & inflation'],
  brokerage:      [Receipt,       'The true cost of trading'],

  emi:            [Banknote,      'Home / car / personal'],
  creditcard:     [CreditCard,    'Escape the debt trap'],

  fdppf:          [Landmark,      'Safe maturity & interest'],
  ssy:            [Baby,          "Your daughter's corpus"],
  postoffice:     [Building2,     'NSC, KVP, SCSS, POMIS'],

  tax:            [Receipt,       'New vs Old regime'],
  capgains:       [Calculator,    'LTCG & STCG tax'],
  salary:         [Briefcase,     'In-hand, HRA, gratuity'],
  jobswitch:      [Shuffle,       'Is the hike real?'],
  budget:         [PieChart,      '50/30/20 allocation'],
};

const GROUP_DESC = {
  'Investments':        'Put every rupee to work',
  'Goals & Retirement': 'Work backwards from the target',
  'Smart Decisions':    'The big “should I…?” questions',
  'Analysis':           'What are you really earning?',
  'Loans':              'Borrow smart, pay less interest',
  'Savings':            'Safe, tax-advantaged schemes',
  'Tax & Salary':       'Know exactly where you stand',
};

// Build the section list straight from the registry, in nav order.
const SECTIONS = NAV_GROUP_ORDER.map(group => ({
  group,
  desc: GROUP_DESC[group] || '',
  items: CALCULATORS.filter(c => c.group === group),
})).filter(s => s.items.length);

const TOTAL = CALCULATORS.length;

// Quick "popular" cards
const POPULAR = [
  { id: 'sip', label: 'SIP', Icon: TrendingUp },
  { id: 'retirement', label: 'Retirement', Icon: Palmtree },
  { id: 'emi', label: 'EMI', Icon: Banknote },
  { id: 'tax', label: 'Income Tax', Icon: Receipt },
  { id: 'crorepati', label: 'Crorepati', Icon: Trophy },
  { id: 'fdppf', label: 'FD / PPF', Icon: Landmark },
];

export default function Dashboard({ onSelect }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [view, setView] = useState('browse'); // 'browse' | 'journeys'
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

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="pt-6 sm:pt-10 pb-8 sm:pb-12 border-b border-slate-200/70 mb-8">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5">
          GoalFi Planner — free financial calculators for India
        </p>
        <h1 className="font-serif-display text-[34px] leading-[1.08] sm:text-[56px] sm:leading-[1.05] text-[#1E1963] tracking-tight max-w-3xl">
          Make every rupee decision<br className="hidden sm:block" /> with <span className="text-[#CA8D1B]">clarity</span>.
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mt-5 max-w-xl leading-relaxed">
          {TOTAL} calculators that answer the questions people actually ask — from “how much SIP for ₹1 crore” to “can I retire today.” Live charts, no sign-up, built for Indian tax and inflation.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-7">
          <button onClick={() => onSelect('sip')}
            className="inline-flex items-center gap-2 bg-[#1E1963] hover:bg-[#030338] text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors">
            Explore calculators <ArrowRight size={16} />
          </button>
          <a href={GOALFI_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#1E1963] font-semibold text-sm px-4 py-3 transition-colors">
            Invest with GoalFi →
          </a>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-3 mt-9">
          {[[String(TOTAL), 'calculators'], ['Live', 'charts & insights'], ['Free', 'no sign-up'], ['India', 'tax & inflation']].map(([n, l]) => (
            <div key={l} className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">{n}</span>
              <span className="text-[13px] text-slate-400">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── View toggle: Browse ⇄ Journeys ───────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-8 w-full sm:w-fit">
        <button onClick={() => setView('browse')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all whitespace-nowrap ${view === 'browse' ? 'bg-white text-[#1E1963] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="sm:hidden">Browse</span>
          <span className="hidden sm:inline">Browse calculators</span>
        </button>
        <button onClick={() => setView('journeys')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all whitespace-nowrap ${view === 'journeys' ? 'bg-white text-[#1E1963] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="sm:hidden">Life stages</span>
          <span className="hidden sm:inline">Start with your moment</span>
        </button>
      </div>

      {view === 'journeys' ? (
        <JourneyRail onSelect={onSelect} />
      ) : (
      <>
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

      {/* ── Most used ────────────────────────────────────────────────── */}
      <p className="font-mono-label text-[11px] uppercase tracking-[0.15em] text-slate-400 mb-3 px-0.5">Most used</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-10">
        {POPULAR.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onSelect(id)}
            className="group bg-white rounded-xl border border-slate-200 p-3 text-left hover:border-[#1E1963] transition-colors">
            <Icon size={18} className="mb-5 text-slate-400 group-hover:text-[#1E1963] transition-colors" strokeWidth={2} />
            <p className="text-[13px] font-semibold text-slate-700 leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Every calculator, grouped (registry-driven) ──────────────── */}
      <div className="space-y-8">
        {SECTIONS.map(section => (
          <div key={section.group}>
            <div className="flex items-baseline gap-3 mb-3 px-0.5">
              <span className="w-6 h-px mt-2.5" style={{ background: '#cbd5e1' }} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-serif-display text-lg font-semibold text-slate-900 leading-tight">{section.group}</h2>
                  <span className="text-[11px] text-slate-300 font-semibold">{section.items.length}</span>
                </div>
                <p className="text-[13px] text-slate-400 leading-tight mt-0.5">{section.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {section.items.map(item => {
                const [Icon, tagline] = META[item.id] || [Sparkles, ''];
                return (
                  <button key={item.id} onClick={() => onSelect(item.id)}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 text-left transition-colors hover:border-slate-900 group">
                    <Icon size={17} className="mb-2.5 text-slate-400 group-hover:text-[#1E1963] transition-colors" strokeWidth={2} />
                    <p className="text-[13px] font-semibold text-slate-800 leading-tight">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      <p className="text-[11px] text-slate-400 mt-8 text-center">
        All calculations are estimates. Consult a SEBI-registered investment advisor before investing.
      </p>
    </div>
  );
}
