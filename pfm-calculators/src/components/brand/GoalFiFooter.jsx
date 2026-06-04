import { ArrowRight } from 'lucide-react';
import { trackSignupClick, trackCtaClick } from '../../lib/analytics';

const APP_URL = 'https://app.goalfi.app';
const WEB_URL = 'https://www.goalfi.app';

const COLUMNS = [
  {
    title: 'Popular Calculators',
    links: [
      { label: 'SIP Calculator', id: 'sip' },
      { label: 'Lumpsum Calculator', id: 'lumpsum' },
      { label: 'Step-Up SIP', id: 'stepup' },
      { label: 'CAGR Calculator', id: 'cagr' },
    ],
  },
  {
    title: 'Plan & Retire',
    links: [
      { label: 'Retirement Planner', id: 'retirement' },
      { label: 'Income & Withdrawal (SWP)', id: 'swp' },
      { label: 'Goal Planner', id: 'goal' },
      { label: 'Readiness Score', id: 'readiness' },
    ],
  },
  {
    title: 'Loans, Tax & Save',
    links: [
      { label: 'EMI Calculator', id: 'emi' },
      { label: 'Income Tax', id: 'tax' },
      { label: 'CTC & Salary', id: 'salary' },
      { label: 'FD / PPF / NPS', id: 'fdppf' },
    ],
  },
];

export default function GoalFiFooter({ onSelect }) {
  return (
    <footer className="bg-[#11161F] text-slate-300 mt-10">
      {/* Sign-up band */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-serif-display text-xl font-semibold text-white leading-tight">
              Planned it here? Now <span className="text-[#5EE5E5]">invest it</span> with GoalFi.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Goal-based SIPs and curated mutual funds — built by IIT-Kanpur quants, run by ex-HSBC.
            </p>
          </div>
          <a href={`${APP_URL}/signup`} target="_blank" rel="noopener noreferrer"
            onClick={() => trackSignupClick('footer_band')}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#5EE5E5] hover:bg-[#3DD6D6] text-[#11161F] font-bold text-sm px-5 py-3 rounded-xl transition-colors">
            Get started free <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-5xl mx-auto px-5 py-9 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand col */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#1A2330] flex items-center justify-center">
              <span className="gf-mark text-[#5EE5E5] text-lg leading-none">G</span>
            </div>
            <span className="font-serif-display font-semibold text-white text-base">GoalFi <span className="text-slate-400 font-sans font-normal text-sm">Planner</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Free, India-first financial calculators. Plan SIPs, retirement, loans and taxes — all in one place.
          </p>
        </div>

        {COLUMNS.map(col => (
          <div key={col.title}>
            <p className="font-mono-label text-[10px] uppercase tracking-widest text-slate-500 mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map(l => (
                <li key={l.id}>
                  <button onClick={() => onSelect(l.id)}
                    className="text-sm text-slate-300 hover:text-[#5EE5E5] transition-colors text-left">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* External + legal */}
      <div className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-5">
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
            {[
              { label: 'GoalFi Research', href: `${WEB_URL}/research` },
              { label: 'GoalFi Plan', href: `${WEB_URL}/plan` },
              { label: 'Markets · Pulse', href: 'https://pulse.goalfi.app' },
              { label: 'Blog', href: 'https://blog.goalfi.app' },
              { label: 'Contact', href: 'mailto:hello@goalfi.app' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#5EE5E5] transition-colors">{l.label}</a>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Calculators are for education and estimation only and are not investment advice. Mutual fund investments are subject to market risks; read all scheme-related documents carefully. GoalFi Plan operates as an AMFI-registered mutual fund distributor. A GoalZen family brand — GoalZen Innovative Solutions Pvt Ltd.
          </p>
          <p className="text-[11px] text-slate-600 mt-3">© {2026} GoalFi · planner.goalfi.app</p>
        </div>
      </div>
    </footer>
  );
}
