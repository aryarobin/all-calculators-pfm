export default function NextSteps({ steps, onNavigate }) {
  if (!steps?.length || !onNavigate) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-700 mb-3">Continue your journey</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {steps.map(n => (
          <button key={n.id} onClick={() => onNavigate(n.id)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group">
            <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{n.label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{n.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
