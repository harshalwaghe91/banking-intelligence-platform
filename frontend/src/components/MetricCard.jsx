import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function MetricCard({ label, value, helper, icon: Icon, tone = "blue", trend }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="panel transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 font-[Manrope] text-3xl font-extrabold text-navy">{value}</p>
        </div>
        {Icon && <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={21} /></span>}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        {trend !== undefined && (
          <span className={`inline-flex items-center font-bold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(trend)}%
          </span>
        )}
        <span>{helper}</span>
      </div>
    </div>
  );
}
