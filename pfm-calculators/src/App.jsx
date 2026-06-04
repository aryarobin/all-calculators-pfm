import { useState } from 'react';
import GoalFiFooter from './components/brand/GoalFiFooter';
import { trackCalcView, trackSignupClick } from './lib/analytics';

import SIPCalculator from './components/calculators/SIPCalculator';
import LumpsumCalculator from './components/calculators/LumpsumCalculator';
import StepUpSIPCalculator from './components/calculators/StepUpSIPCalculator';
import GoalPlanning from './components/calculators/GoalPlanning';
import RetirementCalculator from './components/calculators/RetirementCalculator';
import RetirementReadiness from './components/calculators/RetirementReadiness';
import CAGRCalculator from './components/calculators/CAGRCalculator';
import MoneyMultiplier from './components/calculators/MoneyMultiplier';
import InflationCalculator from './components/calculators/InflationCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import FDPPFCalculator from './components/calculators/FDPPFCalculator';
import TaxCalculator from './components/calculators/TaxCalculator';
import InvestmentComparison from './components/calculators/InvestmentComparison';
import SWPCalculator from './components/calculators/SWPCalculator';
import SalaryCalculator from './components/calculators/SalaryCalculator';
import BudgetPlanner from './components/calculators/BudgetPlanner';
import FinancialTimeline from './components/calculators/FinancialTimeline';
import Dashboard from './components/Dashboard';

const NAV_GROUPS = [
  {
    label: 'Investments',
    items: [
      { id: 'sip', name: 'SIP Calculator', component: SIPCalculator },
      { id: 'lumpsum', name: 'Lumpsum', component: LumpsumCalculator },
      { id: 'stepup', name: 'Step-Up SIP', component: StepUpSIPCalculator },
      { id: 'compare', name: 'Compare Instruments', component: InvestmentComparison },
    ],
  },
  {
    label: 'Goals & Retirement',
    items: [
      { id: 'goal', name: 'Goal Planning', component: GoalPlanning },
      { id: 'retirement', name: 'Retirement Planner', component: RetirementCalculator },
      { id: 'readiness', name: 'Readiness Dashboard', component: RetirementReadiness },
      { id: 'swp', name: 'Income & Withdrawal', component: SWPCalculator },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { id: 'timeline', name: 'Financial Timeline', component: FinancialTimeline },
      { id: 'cagr', name: 'CAGR Calculator', component: CAGRCalculator },
      { id: 'multiplier', name: 'Money Multiplier', component: MoneyMultiplier },
      { id: 'inflation', name: 'Inflation Calculator', component: InflationCalculator },
    ],
  },
  {
    label: 'Loans',
    items: [
      { id: 'emi', name: 'EMI Calculator', component: EMICalculator },
    ],
  },
  {
    label: 'Savings',
    items: [
      { id: 'fdppf', name: 'FD / RD / PPF / NPS', component: FDPPFCalculator },
    ],
  },
  {
    label: 'Tax & Salary',
    items: [
      { id: 'tax', name: 'Income Tax', component: TaxCalculator },
      { id: 'salary', name: 'CTC & Salary', component: SalaryCalculator },
      { id: 'budget', name: 'Budget Planner', component: BudgetPlanner },
    ],
  },
];

const ALL_CALCS = NAV_GROUPS.flatMap(g => g.items);

export default function App() {
  const [activeCalc, setActiveCalc] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = activeCalc === 'home'
    ? null
    : ALL_CALCS.find(c => c.id === activeCalc)?.component;

  const currentCalc = ALL_CALCS.find(c => c.id === activeCalc);

  const handleSelect = (id) => {
    setActiveCalc(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id !== 'home') {
      const c = ALL_CALCS.find(x => x.id === id);
      trackCalcView(id, c?.name);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Top bar — GoalFi branded */}
      <header className="flex-shrink-0 h-12 bg-[#11161F] border-b border-white/10 flex items-center px-3 sm:px-4 gap-3 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1" aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button onClick={() => handleSelect('home')} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-[#1A2330] flex items-center justify-center">
            <span className="gf-mark text-[#5EE5E5] text-base leading-none">G</span>
          </div>
          <span className="font-serif-display font-semibold text-white text-[15px] tracking-tight">
            GoalFi <span className="font-sans font-normal text-slate-400 text-xs">Planner</span>
          </span>
        </button>

        {currentCalc && (
          <>
            <span className="w-px h-4 bg-white/15 hidden sm:block"></span>
            <span className="text-slate-400 text-xs hidden sm:block">{currentCalc.name}</span>
          </>
        )}

        <div className="flex-1"></div>

        <a href="https://app.goalfi.app/signup" target="_blank" rel="noopener noreferrer"
          onClick={() => trackSignupClick('header')}
          className="bg-[#5EE5E5] hover:bg-[#3DD6D6] text-[#11161F] font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          Sign up free
        </a>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className={`
          fixed lg:relative top-11 left-0 bottom-0 z-40
          w-52 bg-slate-900 border-r border-slate-800
          overflow-y-auto flex-shrink-0
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-3 pt-3">
            <button onClick={() => handleSelect('home')}
              className={activeCalc === 'home' ? 'nav-link-active w-full text-left mb-1' : 'nav-link w-full text-left mb-1'}>
              Overview
            </button>

            {NAV_GROUPS.map(group => (
              <div key={group.label} className="mt-4">
                <p className="px-3 mb-1 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{group.label}</p>
                {group.items.map(item => (
                  <button key={item.id} onClick={() => handleSelect(item.id)}
                    className={activeCalc === item.id ? 'nav-link-active w-full text-left' : 'nav-link w-full text-left'}>
                    {item.name}
                  </button>
                ))}
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="px-3 text-[11px] text-slate-600">All calculations are estimates. Consult a SEBI-registered advisor.</p>
            </div>
          </div>
        </nav>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 top-11 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile horizontal scroll nav */}
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-100 px-3 py-2">
            <div className="overflow-x-auto scrollbar-none">
              <div className="flex gap-1 w-max">
                {ALL_CALCS.map(c => (
                  <button key={c.id} onClick={() => handleSelect(c.id)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${activeCalc === c.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
            {/* Breadcrumb */}
            {activeCalc !== 'home' && currentCalc && (
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => handleSelect('home')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Overview</button>
                <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                <span className="text-xs text-slate-600 font-medium">{currentCalc.name}</span>
              </div>
            )}

            {activeCalc === 'home'
              ? <Dashboard onSelect={handleSelect} />
              : ActiveComponent && <ActiveComponent onNavigate={handleSelect} />
            }
          </div>

          {/* GoalFi branded footer — appears at the bottom of every page */}
          <GoalFiFooter onSelect={handleSelect} />
        </main>
      </div>
    </div>
  );
}
