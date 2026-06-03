import { useState, useEffect } from 'react';
import { PERSONAS, DEFAULT_PERSONA } from './utils/personas';

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

const ALL_CALCULATORS = [
  { id: 'sip', label: 'SIP', icon: '📈', name: 'SIP Calculator', desc: 'Monthly SIP → corpus', category: 'invest', component: SIPCalculator },
  { id: 'lumpsum', label: 'Lumpsum', icon: '💰', name: 'Lumpsum', desc: 'One-time investment growth', category: 'invest', component: LumpsumCalculator },
  { id: 'stepup', label: 'Step-Up SIP', icon: '🚀', name: 'Step-Up SIP', desc: 'Increase SIP every year', category: 'invest', component: StepUpSIPCalculator },
  { id: 'compare', label: 'Compare', icon: '⚖️', name: 'Investment Compare', desc: 'FD vs MF vs PPF vs NPS', category: 'invest', component: InvestmentComparison },
  { id: 'goal', label: 'Goals', icon: '🎯', name: 'Goal Planning', desc: 'Home, education, wedding', category: 'plan', component: GoalPlanning },
  { id: 'retirement', label: 'Retire', icon: '🏖️', name: 'Retirement Planner', desc: 'Monthly SIP to retire', category: 'plan', component: RetirementCalculator },
  { id: 'readiness', label: 'Readiness', icon: '🏆', name: 'Retirement Readiness', desc: 'Multi-asset readiness score', category: 'plan', component: RetirementReadiness },
  { id: 'swp', label: 'SWP', icon: '💸', name: 'SWP Calculator', desc: 'Monthly income from corpus', category: 'plan', component: SWPCalculator },
  { id: 'cagr', label: 'CAGR', icon: '📊', name: 'CAGR Calculator', desc: 'True annual return rate', category: 'analysis', component: CAGRCalculator },
  { id: 'multiplier', label: '2x/10x', icon: '🔥', name: 'Money Multiplier', desc: 'When does money 2x/10x?', category: 'analysis', component: MoneyMultiplier },
  { id: 'inflation', label: 'Inflation', icon: '📉', name: 'Inflation Calculator', desc: "Future cost of today's money", category: 'analysis', component: InflationCalculator },
  { id: 'emi', label: 'EMI', icon: '🏠', name: 'EMI Calculator', desc: 'Home/car/personal loan', category: 'loans', component: EMICalculator },
  { id: 'fdppf', label: 'FD/PPF/NPS', icon: '🛡️', name: 'FD / PPF / NPS', desc: 'Safe instruments calculator', category: 'save', component: FDPPFCalculator },
  { id: 'tax', label: 'Tax', icon: '🧾', name: 'Tax Calculator', desc: 'New vs Old regime', category: 'tax', component: TaxCalculator },
  { id: 'salary', label: 'Salary', icon: '💼', name: 'CTC & Salary', desc: 'In-hand, HRA, gratuity', category: 'tax', component: SalaryCalculator },
  { id: 'budget', label: 'Budget', icon: '📋', name: 'Budget Planner', desc: '50/30/20 rule & tracking', category: 'plan', component: BudgetPlanner },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'invest', label: 'Invest' },
  { id: 'plan', label: 'Plan' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'loans', label: 'Loans' },
  { id: 'save', label: 'Save' },
  { id: 'tax', label: 'Tax' },
];

export default function App() {
  const [activeCalc, setActiveCalc] = useState('sip');
  const [persona, setPersona] = useState(DEFAULT_PERSONA);
  const [category, setCategory] = useState('all');
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = ALL_CALCULATORS.find(c => c.id === activeCalc)?.component;
  const currentCalc = ALL_CALCULATORS.find(c => c.id === activeCalc);
  const currentPersona = PERSONAS[persona];
  const filteredCalcs = category === 'all' ? ALL_CALCULATORS : ALL_CALCULATORS.filter(c => c.category === category);

  useEffect(() => {
    const saved = localStorage.getItem('pfm-persona');
    if (saved && PERSONAS[saved]) setPersona(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('pfm-persona', persona);
  }, [persona]);

  const handleCalcSelect = (id) => {
    setActiveCalc(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Menu">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg" style={{ background: `linear-gradient(135deg, ${currentPersona.color}, ${currentPersona.color}cc)` }}>
                ₹
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm sm:text-base leading-tight">PFM Calculators</p>
                <p className="text-xs text-slate-400 leading-tight hidden sm:block">India's Smartest Finance Tool</p>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center hidden md:block">
            <p className="font-bold text-slate-700 text-sm">{currentCalc?.icon} {currentCalc?.name}</p>
          </div>

          <button onClick={() => setShowPersonaModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all hover:shadow-md flex-shrink-0"
            style={{ borderColor: currentPersona.color + '60', background: currentPersona.color + '10' }}>
            <span className="text-lg">{currentPersona.emoji}</span>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-tight" style={{ color: currentPersona.color }}>{currentPersona.name}</p>
              <p className="text-xs text-slate-400 leading-tight">Switch mode</p>
            </div>
          </button>
        </div>
      </header>

      {/* Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPersonaModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-800">Choose Your Vibe ✨</h3>
                <p className="text-sm text-slate-400">Each mode has its own tone, focus & language</p>
              </div>
              <button onClick={() => setShowPersonaModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 text-sm font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(PERSONAS).map(p => (
                <button key={p.id} onClick={() => { setPersona(p.id); setShowPersonaModal(false); }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-center ${persona === p.id ? 'shadow-lg' : 'border-slate-100 hover:shadow-md'}`}
                  style={persona === p.id ? { borderColor: p.color, background: p.color + '15' } : {}}>
                  <span className="text-2xl">{p.emoji}</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={persona === p.id ? { color: p.color } : { color: '#334155' }}>{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{p.tagline}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-4">{currentPersona.description}</p>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-white border-r border-slate-100 z-40 transition-transform duration-300 overflow-y-auto flex-shrink-0`}>
          <div className="p-3">
            {/* Persona banner */}
            <div className="p-3 rounded-2xl mb-3 text-white cursor-pointer" style={{ background: `linear-gradient(135deg, ${currentPersona.color}, ${currentPersona.color}cc)` }}
              onClick={() => { setShowPersonaModal(true); setSidebarOpen(false); }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentPersona.emoji}</span>
                <div>
                  <p className="font-bold text-sm leading-tight">{currentPersona.name}</p>
                  <p className="text-xs opacity-80 leading-tight">{currentPersona.tagline}</p>
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${category === cat.id ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    style={category === cat.id ? { background: currentPersona.color } : {}}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator list */}
            <div className="space-y-0.5">
              {filteredCalcs.map(calc => (
                <button key={calc.id} onClick={() => handleCalcSelect(calc.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${activeCalc === calc.id ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                  style={activeCalc === calc.id ? { background: `linear-gradient(135deg, ${currentPersona.color}, ${currentPersona.color}cc)` } : {}}>
                  <span className="text-lg flex-shrink-0">{calc.icon}</span>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm leading-tight truncate ${activeCalc === calc.id ? 'text-white' : ''}`}>{calc.name}</p>
                    <p className={`text-xs leading-tight truncate ${activeCalc === calc.id ? 'text-white/70' : 'text-slate-400'}`}>{calc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
          {/* Mobile horizontal nav */}
          <div className="lg:hidden mb-4 -mx-1">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 px-1 w-max">
                {ALL_CALCULATORS.map(calc => (
                  <button key={calc.id} onClick={() => setActiveCalc(calc.id)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all flex-shrink-0 ${activeCalc === calc.id ? 'shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    style={activeCalc === calc.id ? { borderColor: currentPersona.color, background: currentPersona.color, color: 'white' } : {}}>
                    <span className="text-xl">{calc.icon}</span>
                    <span className={`text-xs font-semibold mt-0.5 whitespace-nowrap ${activeCalc === calc.id ? 'text-white' : 'text-slate-500'}`}>{calc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active calculator */}
          {ActiveComponent && <ActiveComponent persona={PERSONAS[persona]} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-white border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">PFM Calculators — India's most comprehensive personal finance tool</p>
        <p className="text-xs text-slate-300 mt-0.5">All calculations are estimates. Consult a SEBI-registered advisor for personalized advice.</p>
      </footer>
    </div>
  );
}
