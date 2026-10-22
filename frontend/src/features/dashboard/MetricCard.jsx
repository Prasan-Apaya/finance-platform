export default function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-secondary border border-border-secondary rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-tertiary">{title}</span>
        {Icon && <Icon className="h-5 w-5 text-tertiary" />}
      </div>
      <div className="text-2xl font-semibold text-secondary tabular-nums">{value}</div>
      {subtitle && <div className="text-xs text-tertiary mt-1">{subtitle}</div>}
    </div>
  );
}