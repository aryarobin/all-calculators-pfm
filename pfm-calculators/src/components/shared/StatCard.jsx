export default function StatCard({ label, value, sub, color = 'slate', large = false }) {
  const colors = {
    blue: 'bg-blue-700 text-white',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider opacity-70 mb-1`}>{label}</p>
      <p className={`font-bold leading-tight ${large ? 'text-3xl' : 'text-xl'}`}>{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}
