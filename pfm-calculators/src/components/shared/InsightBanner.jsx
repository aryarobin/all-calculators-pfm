export default function InsightBanner({ insights = [], type = 'info' }) {
  if (!insights.length) return null;
  const styles = {
    info: 'bg-blue-50 border-blue-100 text-blue-800',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
  };
  return (
    <div className={`px-4 py-3 rounded-xl border ${styles[type]}`}>
      {insights.map((ins, i) => (
        <p key={i} className="text-xs font-medium leading-relaxed mb-0.5 last:mb-0">{ins}</p>
      ))}
    </div>
  );
}
