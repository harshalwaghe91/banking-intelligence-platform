export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <section className="panel min-w-0">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-navy">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
