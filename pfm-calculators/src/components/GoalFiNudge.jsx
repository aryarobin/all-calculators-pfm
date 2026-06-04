import { ArrowRight, TrendingUp } from 'lucide-react';
import { GOALFI_URL } from '../calculators';
import { trackSignupClick, trackCtaClick } from '../lib/analytics';

// Contextual top-of-funnel nudge shown after a calculator result. Copy adapts
// to the calculator's group so it feels relevant, not generic spam.
const COPY = {
  'Investments':        { line: "You've got the number — now put it to work.", sub: "GoalFi's research-backed portfolios help you invest it well." },
  'Mutual Funds':       { line: 'Pick funds with conviction, not guesswork.', sub: 'GoalFi does the research so your SIPs go into the right funds.' },
  'Goals & Retirement': { line: 'A plan only works if you act on it.', sub: 'Invest toward this goal with a GoalFi research portfolio.' },
  'Analysis':           { line: 'Numbers are clearer now. Ready to invest?', sub: 'GoalFi turns analysis into a portfolio built on research.' },
  'Smart Decisions':    { line: 'Made the call? Make your money follow.', sub: 'Build a research-backed portfolio with GoalFi.' },
  'Loans':              { line: 'Free cash flow deserves a smart home.', sub: 'Put your surplus to work with GoalFi research portfolios.' },
  'Savings':            { line: 'Want your savings to do more?', sub: 'Explore GoalFi’s research-backed investment portfolios.' },
  'Tax & Salary':       { line: 'Keep more, then grow it.', sub: 'Invest your take-home with a GoalFi research portfolio.' },
};
const DEFAULT = { line: 'Ready to put this into action?', sub: 'Explore GoalFi’s research-backed investment portfolios.' };

export default function GoalFiNudge({ calc }) {
  const copy = (calc && COPY[calc.group]) || DEFAULT;

  const onClick = () => {
    trackSignupClick('calculator_nudge');
    trackCtaClick('calculator_nudge', calc?.id || 'unknown');
  };

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#1E1963] to-[#030338] p-5 sm:p-6 text-white overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" aria-hidden />
      <div className="absolute -right-2 bottom-2 w-20 h-20 rounded-full bg-[#CA8D1B]/10" aria-hidden />
      <div className="relative flex items-start gap-4">
        <div className="hidden sm:flex w-11 h-11 rounded-xl bg-white/10 items-center justify-center flex-shrink-0">
          <TrendingUp size={22} strokeWidth={2} className="text-[#E6A125]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono-label text-[10px] uppercase tracking-[0.18em] text-[#E6A125] mb-1.5">From calculation to action</p>
          <p className="text-[15px] sm:text-base font-bold leading-snug">{copy.line}</p>
          <p className="text-[13px] text-slate-300 mt-1 leading-relaxed">{copy.sub}</p>
          <a href={GOALFI_URL} target="_blank" rel="noopener noreferrer" onClick={onClick}
            className="inline-flex items-center gap-1.5 mt-3.5 bg-[#CA8D1B] hover:bg-[#E6A125] text-[#030338] font-bold text-[13px] px-4 py-2 rounded-lg transition-colors">
            Explore GoalFi <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
