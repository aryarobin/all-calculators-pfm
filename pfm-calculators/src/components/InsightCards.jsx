import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { calcSIP, calcMultipleTime, calcInflation, formatINR } from '../utils/financialCalc';

// Editorial "facts" — restrained, typographic, one quiet accent per row.
const CARDS = [
  {
    kind: 'Did you know',
    accent: '#0891b2',
    headline: () => {
      const a = calcSIP(10000, 12, 30).corpus;
      const b = calcSIP(10000, 12, 20).corpus;
      return `₹10,000/month for 30 years grows to ${formatINR(a)} — but stop at 20 years and it's only ${formatINR(b)}.`;
    },
    sub: 'The final decade does the heaviest lifting. Starting early beats investing more.',
    cta: 'See the compounding curve', to: 'sip',
  },
  {
    kind: 'SIP, in numbers',
    accent: '#059669',
    headline: () => {
      const r = calcSIP(5000, 12, 25);
      return `A ₹5,000 monthly SIP for 25 years becomes ${formatINR(r.corpus)} — and ${formatINR(r.gains)} of it is pure returns.`;
    },
    sub: 'You contribute ₹15 lakh. The market provides the rest.',
    cta: 'Model your own SIP', to: 'sip',
  },
  {
    kind: 'The rule of 72',
    accent: '#7c3aed',
    headline: () => {
      const yrs = calcMultipleTime(10, 12);
      return `At 12% a year, money becomes 10× in roughly ${Math.round(yrs)} years — with no extra effort.`;
    },
    sub: 'It doubles every ~6 years. Four doublings make 16×.',
    cta: 'When does mine 10×?', to: 'multiplier',
  },
  {
    kind: 'Inflation, quietly',
    accent: '#dc2626',
    headline: () => {
      const future = calcInflation(50000, 6, 25);
      return `₹50,000/month of expenses today will cost ${formatINR(future)}/month in 25 years at 6% inflation.`;
    },
    sub: "If your money isn't outpacing inflation, you're slowly getting poorer.",
    cta: 'See inflation\'s real bite', to: 'inflation',
  },
  {
    kind: 'Could you retire today',
    accent: '#d97706',
    headline: () => {
      const corpus = 200000 * 12 / 0.035;
      return `With ₹2L/month expenses, about ${formatINR(corpus)} could let you retire now and live off returns.`;
    },
    sub: 'Your FIRE number, after tax — far smaller with equity than with FD.',
    cta: 'Find your FIRE number', to: 'fire',
  },
  {
    kind: 'Prepay or invest',
    accent: '#0d9488',
    headline: () => `If your home loan costs 8.5% and equity returns 11% post-tax, investing the surplus usually wins.`,
    sub: 'Guaranteed savings vs uncertain returns — your numbers decide.',
    cta: 'Settle the debate', to: 'prepay',
  },
];

export default function InsightCards({ onSelect }) {
  const cards = useMemo(() => CARDS.map(c => ({ ...c, text: c.headline() })), []);

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif-display text-xl sm:text-2xl font-semibold text-slate-900">Money truths most people miss</h2>
        <span className="font-mono-label text-[11px] uppercase tracking-widest text-slate-400 hidden sm:block">Tap to explore</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
        {cards.map((c, i) => (
          <button key={i} onClick={() => onSelect(c.to)}
            className="group bg-white hover:bg-slate-50 p-5 text-left transition-colors flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />
              <span className="font-mono-label text-[10px] uppercase tracking-[0.15em] text-slate-400">{c.kind}</span>
            </div>
            <p className="text-[15px] font-semibold text-slate-800 leading-snug flex-1">{c.text}</p>
            <p className="text-[13px] text-slate-400 mt-2 leading-snug">{c.sub}</p>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold mt-3 transition-colors"
              style={{ color: c.accent }}>
              {c.cta}
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
