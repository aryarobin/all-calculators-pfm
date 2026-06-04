import { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Flame, Home, Clock, Percent, PiggyBank, Receipt } from 'lucide-react';
import { calcSIP, calcMultipleTime, calcInflation, formatINR } from '../utils/financialCalc';

// Curiosity-driven cards. Each poses a real question, shows a punchy live
// answer, and routes to the calculator that lets the user explore it.
const CARDS = [
  {
    kind: 'Did you know?',
    Icon: Clock,
    grad: 'from-blue-500 to-indigo-600',
    headline: () => {
      const a = calcSIP(10000, 12, 30).corpus;
      const b = calcSIP(10000, 12, 20).corpus;
      return `₹10,000/mo for 30 years becomes ${formatINR(a)} — but for 20 years, only ${formatINR(b)}.`;
    },
    sub: 'The last 10 years do the heaviest lifting. Starting early beats investing more.',
    cta: 'See the compounding curve', to: 'sip',
  },
  {
    kind: 'SIP magic',
    Icon: TrendingUp,
    grad: 'from-emerald-500 to-teal-600',
    headline: () => {
      const r = calcSIP(5000, 12, 25);
      return `A ₹5,000/mo SIP for 25 years = ${formatINR(r.corpus)} — and ${formatINR(r.gains)} of that is pure returns.`;
    },
    sub: 'You invest ₹15 lakh. The market hands you the rest.',
    cta: 'Try your own SIP', to: 'sip',
  },
  {
    kind: 'Compounding wonders',
    Icon: Sparkles,
    grad: 'from-violet-500 to-purple-600',
    headline: () => {
      const yrs = calcMultipleTime(10, 12);
      return `At 12% a year, your money becomes 10× in just ${Math.round(yrs)} years — no extra effort.`;
    },
    sub: 'Rule of 72: at 12%, money doubles every 6 years. Four doublings = 16×.',
    cta: 'When will mine 10×?', to: 'multiplier',
  },
  {
    kind: 'The silent thief',
    Icon: Receipt,
    grad: 'from-rose-500 to-red-600',
    headline: () => {
      const future = calcInflation(50000, 6, 25);
      return `₹50,000/mo of expenses today will cost ${formatINR(future)}/mo in 25 years at 6% inflation.`;
    },
    sub: 'If your money isn\'t growing faster than inflation, you\'re getting poorer.',
    cta: 'See inflation\'s bite', to: 'inflation',
  },
  {
    kind: 'Could you retire today?',
    Icon: Flame,
    grad: 'from-amber-500 to-orange-600',
    headline: () => {
      const annual = 200000 * 12;       // ₹2L/mo
      const corpus = annual / 0.035;    // 3.5% safe withdrawal
      return `With ₹2L/mo expenses, you'd need about ${formatINR(corpus)} to retire now and live off returns at a safe 3.5%.`;
    },
    sub: 'Your FIRE number, after tax — far smaller with equity than with FD.',
    cta: 'Find your FIRE number', to: 'fire',
  },
  {
    kind: 'Prepay or invest?',
    Icon: Home,
    grad: 'from-cyan-500 to-blue-600',
    headline: () => `If your home loan is 8.5% and equity gives 11% post-tax, investing the surplus usually beats prepaying.`,
    sub: 'But guaranteed savings vs uncertain returns — the answer depends on your numbers.',
    cta: 'Settle the debate', to: 'prepay',
  },
];

export default function InsightCards({ onSelect }) {
  const [active, setActive] = useState(0);

  const cards = useMemo(() => CARDS.map(c => ({ ...c, text: c.headline() })), []);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles size={15} className="text-amber-500" />
        <p className="text-sm font-bold text-slate-700">Money truths most people miss</p>
      </div>

      {/* Featured rotating card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {cards.slice(0, 3).map((c, i) => (
          <button key={i} onClick={() => onSelect(c.to)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.grad} p-5 text-left text-white transition-transform active:scale-[0.98] hover:shadow-lg`}>
            <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <c.Icon size={15} />
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{c.kind}</span>
              </div>
              <p className="text-[15px] font-bold leading-snug">{c.text}</p>
              <p className="text-xs opacity-70 mt-2 leading-snug">{c.sub}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold mt-3 opacity-90 group-hover:gap-2 transition-all">
                {c.cta} <ArrowRight size={13} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary row — lighter style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        {cards.slice(3).map((c, i) => (
          <button key={i} onClick={() => onSelect(c.to)}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-1.5 mb-1.5">
              <c.Icon size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{c.kind}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-snug">{c.text}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-2 group-hover:gap-1.5 transition-all">
              {c.cta} <ArrowRight size={12} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
