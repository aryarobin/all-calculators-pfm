import { useState, useEffect } from 'react';
import {
  GraduationCap, Gift, Home, Baby, CreditCard, Flame, Sunrise, LineChart,
  ArrowRight, X,
} from 'lucide-react';
import { byId } from '../calculators';

// Life-stage journeys — each is a curated, ordered path through a few
// calculators with a one-line "why" per step. The point: a worried person
// picks the moment they're in, not a taxonomy category.
const JOURNEYS = [
  {
    id: 'first-salary', Icon: GraduationCap, tag: 'First salary',
    title: 'I just started earning',
    chip: 'bg-blue-50 text-[#1E1963]',
    intro: 'Set the foundations right from your first paycheck — before lifestyle creep sets in.',
    steps: [
      { id: 'budget',    why: 'Split your salary the 50/30/20 way so saving happens on autopilot.' },
      { id: 'emergency', why: 'Build a few months of cushion before you invest a single rupee.' },
      { id: 'tax',       why: 'Pick the right tax regime so you keep more of what you earn.' },
      { id: 'sip',       why: 'Start your first SIP — time in the market matters more than amount.' },
    ],
  },
  {
    id: 'windfall', Icon: Gift, tag: 'Bonus / windfall',
    title: 'I got a lump sum',
    chip: 'bg-amber-50 text-[#CA8D1B]',
    intro: 'Bonus, ESOP payout, inheritance — deploy it well instead of letting it sit idle.',
    steps: [
      { id: 'lumpvssip', why: 'Invest it all at once, or stagger via STP? See the timing trade-off.' },
      { id: 'prepay',    why: 'Or should it go toward clearing a loan instead of the market?' },
      { id: 'capgains',  why: 'Know the tax before you sell anything to fund it.' },
      { id: 'goal',      why: 'Or earmark it for a specific goal and let it compound.' },
    ],
  },
  {
    id: 'home', Icon: Home, tag: 'Buying a home',
    title: "I'm buying a house",
    chip: 'bg-emerald-50 text-[#3EA23C]',
    intro: 'The biggest purchase of your life — get the maths right before you sign.',
    steps: [
      { id: 'rentbuy', why: 'First question: does buying even beat renting and investing the gap?' },
      { id: 'emi',     why: 'What the EMI, total interest and schedule actually look like.' },
      { id: 'goal',    why: 'Plan the down payment as a time-bound goal.' },
      { id: 'prepay',  why: 'Later — prepay the loan or invest the surplus?' },
    ],
  },
  {
    id: 'child', Icon: Baby, tag: 'Family',
    title: "I'm planning for my child",
    chip: 'bg-rose-50 text-[#E33434]',
    intro: 'Education, security and protection — the three things every parent worries about.',
    steps: [
      { id: 'ssy',       why: 'For a daughter — tax-free 8.2% under Sukanya Samriddhi.' },
      { id: 'goal',      why: 'Plan college costs 15–18 years out, inflation-adjusted.' },
      { id: 'termcover', why: "Make sure they're protected if you aren't around." },
      { id: 'healthcover', why: 'Adequate family health cover against medical inflation.' },
    ],
  },
  {
    id: 'debt', Icon: CreditCard, tag: 'Getting out of debt',
    title: 'I want to clear my debt',
    chip: 'bg-orange-50 text-[#CA8D1B]',
    intro: 'Expensive debt quietly undoes every other good money decision. Kill it first.',
    steps: [
      { id: 'creditcard', why: 'See the brutal cost of the minimum-payment trap at 36–48%.' },
      { id: 'emi',        why: 'Understand your loan EMIs and total interest.' },
      { id: 'prepay',     why: 'Whether to throw surplus at the loan or invest it.' },
      { id: 'budget',     why: 'Free up monthly cash flow to attack the debt.' },
    ],
  },
  {
    id: 'fire', Icon: Flame, tag: 'Retire early',
    title: 'I want financial freedom',
    chip: 'bg-violet-50 text-[#334BA0]',
    intro: 'The number that lets you stop working — and the path to get there.',
    steps: [
      { id: 'fire',       why: 'Your FIRE number: enough to live off returns forever.' },
      { id: 'coast',      why: 'When compounding alone can carry you — so you can ease off.' },
      { id: 'retirement', why: 'The corpus and SIP to retire at your target age.' },
      { id: 'swp',        why: 'How to draw a monthly income from the corpus later.' },
    ],
  },
  {
    id: 'pre-retire', Icon: Sunrise, tag: 'Near retirement',
    title: "I'm close to retiring",
    chip: 'bg-cyan-50 text-[#1E1963]',
    intro: 'Shift from growing the corpus to protecting it and drawing a steady income.',
    steps: [
      { id: 'readiness',   why: 'Score how ready you actually are across all your assets.' },
      { id: 'swp',         why: 'Plan a sustainable monthly withdrawal that lasts.' },
      { id: 'postoffice',  why: 'SCSS and POMIS for safe, regular retiree income.' },
      { id: 'healthcover', why: 'Health cover matters most exactly when you stop working.' },
    ],
  },
  {
    id: 'investor', Icon: LineChart, tag: 'Active investor',
    title: "I'm an active investor",
    chip: 'bg-slate-100 text-slate-700',
    intro: 'Sharpen the decisions that quietly decide whether you actually beat the index.',
    steps: [
      { id: 'xirr',          why: 'Your true annualised return, accounting for every cashflow.' },
      { id: 'directregular', why: 'Are you bleeding lakhs to regular-plan commissions?' },
      { id: 'brokerage',     why: 'What trading charges really cost you every year.' },
      { id: 'gold',          why: 'The smartest wrapper for any gold allocation.' },
    ],
  },
];

function JourneyModal({ journey, onSelect, onClose }) {
  // Lock background scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const { Icon } = journey;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-[#030338]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 sm:px-6 pt-5 pb-4 flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${journey.chip}`}>
            <Icon size={22} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono-label text-[10px] uppercase tracking-[0.15em] text-slate-400">{journey.tag}</p>
            <h3 className="font-serif-display text-lg font-bold text-[#1E1963] leading-tight">{journey.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5">
          <p className="text-sm text-slate-500 leading-relaxed mb-5">{journey.intro}</p>

          <div className="relative">
            {journey.steps.map((step, i) => {
              const calc = byId[step.id];
              if (!calc) return null;
              const last = i === journey.steps.length - 1;
              return (
                <button key={step.id} onClick={() => onSelect(step.id)}
                  className="group w-full text-left flex gap-3.5 pb-4 last:pb-0">
                  {/* number + connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-7 h-7 rounded-full bg-[#1E1963] text-white text-[12px] font-bold flex items-center justify-center group-hover:bg-[#CA8D1B] transition-colors">
                      {i + 1}
                    </span>
                    {!last && <span className="w-px flex-1 bg-slate-200 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 -mt-0.5 pb-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-semibold text-slate-900 leading-tight group-hover:text-[#1E1963] transition-colors">{calc.name}</p>
                      <ArrowRight size={13} className="text-slate-300 group-hover:text-[#CA8D1B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{step.why}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-5 pt-1">
          <p className="text-[11px] text-slate-400">Tap any step to open that calculator. You can come back to this path anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default function JourneyRail({ onSelect }) {
  const [active, setActive] = useState(null);

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-3 px-0.5">
        <div>
          <h2 className="font-serif-display text-lg font-semibold text-slate-900 leading-tight">Where are you right now?</h2>
          <p className="text-[13px] text-slate-400 leading-tight mt-0.5">Pick your moment — we'll walk you through it, step by step.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {JOURNEYS.map(j => {
          const { Icon } = j;
          return (
            <button key={j.id} onClick={() => setActive(j)}
              className="bg-white rounded-xl border border-slate-200 p-3.5 text-left transition-all hover:border-[#1E1963] hover:shadow-sm group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${j.chip}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">{j.title}</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug flex items-center gap-1">
                {j.steps.length} steps
                <ArrowRight size={11} className="text-slate-300 group-hover:text-[#CA8D1B] group-hover:translate-x-0.5 transition-all" />
              </p>
            </button>
          );
        })}
      </div>

      {active && <JourneyModal journey={active} onSelect={onSelect} onClose={() => setActive(null)} />}
    </div>
  );
}
