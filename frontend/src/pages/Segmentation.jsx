import { useEffect, useState } from "react";
import { Crown, HeartHandshake, Sparkles, TriangleAlert, Users } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import api from "../api";
import Loader from "../components/Loader";

const styles = {
  "Loyal Customers": { icon: HeartHandshake, color: "#2f7df6", className: "bg-blue-50 text-blue-600" },
  "At-Risk Customers": { icon: TriangleAlert, color: "#f0526e", className: "bg-rose-50 text-rose-600" },
  "Premium Customers": { icon: Crown, color: "#8b5cf6", className: "bg-violet-50 text-violet-600" },
  "New Customers": { icon: Sparkles, color: "#24b47e", className: "bg-emerald-50 text-emerald-600" },
};

export default function Segmentation() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/segments").then((r) => setData(r.data)).catch((e) => setError(e.message)); }, []);
  if (!data && !error) return <Loader label="Discovering customer segments..." />;
  if (error) return <div className="panel text-rose-700">{error}</div>;

  return (
    <div>
      <p className="eyebrow">Behavioral intelligence</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy">Customer segmentation</h1>
      <p className="mt-2 text-sm text-slate-500">Four actionable personas derived from value, engagement, tenure, and churn behavior.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {data.segments.map((segment) => {
          const visual = styles[segment.name]; const Icon = visual.icon;
          return (
            <article key={segment.name} className="panel transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between"><span className={`grid h-12 w-12 place-items-center rounded-xl ${visual.className}`}><Icon size={23} /></span><span className="text-2xl font-extrabold text-navy">{segment.percentage}%</span></div>
              <h2 className="mt-5 text-lg font-bold text-navy">{segment.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{segment.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div><p className="text-xs text-slate-400">Customers</p><p className="mt-1 font-bold text-slate-700">{segment.count.toLocaleString()}</p></div>
                <div><p className="text-xs text-slate-400">Churn rate</p><p className="mt-1 font-bold text-slate-700">{segment.churn_rate}%</p></div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="panel">
          <h2 className="font-bold text-navy">Portfolio composition</h2>
          <p className="mt-1 text-xs text-slate-500">{data.total_customers.toLocaleString()} customers analyzed</p>
          <div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.segments} dataKey="count" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>{data.segments.map((entry) => <Cell key={entry.name} fill={styles[entry.name].color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="panel">
          <h2 className="font-bold text-navy">Segment strategy guide</h2>
          <p className="mt-1 text-xs text-slate-500">Recommended operating focus for each customer persona</p>
          <div className="mt-5 space-y-3">
            {[
              ["Loyal Customers", "Deepen relationships through recognition, referrals, and relevant cross-sell."],
              ["At-Risk Customers", "Prioritize outreach, resolve friction, and present a targeted save offer."],
              ["Premium Customers", "Protect value with concierge service, fee benefits, and proactive reviews."],
              ["New Customers", "Accelerate onboarding, product discovery, and early loyalty formation."],
            ].map(([name, action]) => <div key={name} className="flex gap-4 rounded-xl border border-slate-100 p-4"><span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: styles[name].color }} /><div><h3 className="text-sm font-bold text-navy">{name}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{action}</p></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
