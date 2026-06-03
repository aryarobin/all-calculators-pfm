import { useState, useEffect } from 'react';

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
      { id: 'swp', name: 'Withdrawal Plan (SWP)', component: SWPCalculator },
    ],
  },
  {
    label: 'Analysis',
    items: [
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

function NavItem({ item, active, onClick }) {
  return (
    <button onClick={() => onClick(item.id)}
      className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}>
      <span className="text-xs leading-tight">{item.name}</span>
    </button>
  );
}

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
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top nav */}
      <header className="h-12 bg-[#0f172a] border-b border-slate-800 flex items-center px-4 gap-4 sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button onClick={() => handleSelect('home')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">₹</div>
          <span className="text-white font-bold text-sm hidden sm:block">PFM Suite</span>
          <span className="text-slate-500 text-xs hidden sm:block">India</span>
        </button>

        <div className="flex-1"></div>

        {/* Breadcrumb */}
        {currentCalc && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => handleSelect('home')} className="hover:text-white transition-colors">Home</button>
            <span>/</span>
            <span className="text-slate-300">{currentCalc.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-slate-500 hidden sm:block">FY 2024-25</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative top-12 left-0 bottom-0
          w-52 bg-[#0f172a] border-r border-slate-800
          z-40 transition-transform duration-200 overflow-y-auto flex-shrink-0
        `}>
          <div className="p-3 pt-4">
            {/* Home link */}
            <button onClick={() => handleSelect('home')}
              className={`nav-item w-full mb-2 text-sm font-semibold ${activeCalc === 'home' ? 'nav-item-active' : 'nav-item-inactive'}`}>
              Overview
            </button>

            {NAV_GROUPS.map(group => (
              <div key={group.label} className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">{group.label}</p>
                {group.items.map(item => (
                  <NavItem key={item.id} item={item} active={activeCalc === item.id} onClick={handleSelect} />
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 top-12 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Mobile calc tabs */}
          <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-2 overflow-x-auto">
            <div className="flex gap-1.5 w-max">
              {ALL_CALCS.map(calc => (
                <button key={calc.id} onClick={() => handleSelect(calc.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeCalc === calc.id ? 'bg-blue-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                  {calc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            {/* Page header */}
            {activeCalc !== 'home' && currentCalc && (
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Calculator</p>
                  <h1 className="text-xl font-bold text-slate-900">{currentCalc.name}</h1>
                </div>
                <button onClick={() => handleSelect('home')} className="text-xs text-slate-400 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-200">
                  ← All Tools
                </button>
              </div>
            )}

            {activeCalc === 'home'
              ? <Dashboard onSelect={handleSelect} />
              : ActiveComponent && <ActiveComponent onNavigate={handleSelect} />
            }
          </div>
        </main>
      </div>
    </div>
  );
}
