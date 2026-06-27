import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CircleDollarSign, RefreshCw, ShieldCheck, Users } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import api from "../api";
import ChartCard from "../components/ChartCard";
import Loader from "../components/Loader";
import MetricCard from "../components/MetricCard";

const BLUE = "#2f7df6";
const CYAN = "#27c5e8";
const ROSE = "#f0526e";
const EMERALD = "#24b47e";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    api.get("/analytics").then((response) => setData(response.data)).catch((err) => setError(err.message));
  };
  useEffect(load, []);

  if (!data && !error) return <Loader label="Building portfolio analytics..." />;

  const pieData = data ? [
    { name: "Retained", value: data.retained_customers, color: BLUE },
    { name: "Churned", value: data.churned_customers, color: ROSE },
  ] : [];
  const activeData = data?.active_member_churn.map((item) => ({
    ...item, name: Number(item.name) === 1 ? "Active" : "Inactive",
  })) || [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Executive overview</p><h1 className="mt-2 text-3xl font-extrabold text-navy">Customer intelligence dashboard</h1><p className="mt-2 text-sm text-slate-500">A portfolio-wide view of churn, engagement, and behavioral risk.</p></div>
        <button onClick={load} className="btn-secondary !py-2.5 text-sm"><RefreshCw size={16} /> Refresh data</button>
      </div>
      {error ? <div className="panel mt-7 text-rose-700">{error}</div> : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total customers" value={data.total_customers.toLocaleString()} helper="Portfolio records" icon={Users} />
            <MetricCard label="Retained" value={data.retained_customers.toLocaleString()} helper="Current retained base" icon={ShieldCheck} tone="emerald" />
            <MetricCard label="Churned" value={data.churned_customers.toLocaleString()} helper="Historical exits" icon={Activity} tone="rose" />
            <MetricCard label="Churn rate" value={`${data.churn_rate}%`} helper="Portfolio average" icon={CircleDollarSign} tone="violet" />
            <MetricCard label="Priority risk" value={data.high_risk_customers.toLocaleString()} helper="Churned & inactive" icon={AlertTriangle} tone="rose" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <ChartCard title="Customer outcomes" subtitle="Retained versus churned customers">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100} paddingAngle={4}>{pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <ChartCard title="Churn by geography" subtitle="Customer count and churn rate across operating markets">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.geography_wise_churn} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend />
                    <Bar dataKey="customers" name="Customers" fill={BLUE} radius={[6, 6, 0, 0]} /><Bar dataKey="churned" name="Churned" fill={ROSE} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Age-group churn pattern" subtitle="Churn rate by customer age bracket">
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.age_group_churn} margin={{ top: 8, right: 18, left: -18 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} unit="%" /><Tooltip /><Line type="monotone" dataKey="churn_rate" name="Churn rate" stroke={ROSE} strokeWidth={3} dot={{ r: 5, fill: ROSE }} /></LineChart></ResponsiveContainer></div>
            </ChartCard>
            <ChartCard title="Product portfolio behavior" subtitle="Churn rate by number of bank products">
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.product_wise_churn} margin={{ top: 8, right: 10, left: -18 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" /><XAxis dataKey="name" tick={{ fontSize: 12 }} label={{ value: "Products", position: "insideBottom", offset: -2 }} /><YAxis tick={{ fontSize: 11 }} unit="%" /><Tooltip /><Bar dataKey="churn_rate" name="Churn rate" fill={CYAN} radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </ChartCard>
            <ChartCard title="Engagement impact" subtitle="Active versus inactive customer churn">
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={activeData} layout="vertical" margin={{ left: 12, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" /><XAxis type="number" unit="%" /><YAxis dataKey="name" type="category" width={65} /><Tooltip /><Bar dataKey="churn_rate" name="Churn rate" fill={EMERALD} radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer></div>
            </ChartCard>
            <ChartCard title="Gender distribution" subtitle="Churn rate comparison by gender">
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.gender_wise_churn} margin={{ left: -18, right: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" /><XAxis dataKey="name" /><YAxis unit="%" /><Tooltip /><Bar dataKey="churn_rate" name="Churn rate" fill={BLUE} radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
