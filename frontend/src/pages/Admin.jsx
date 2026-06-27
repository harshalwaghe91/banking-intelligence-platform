import { useEffect, useState } from "react";
import { Filter, Search, Users } from "lucide-react";
import api from "../api";
import Loader from "../components/Loader";

export default function Admin() {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({ risk_level: "", geography: "", gender: "", churn_status: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true); setError("");
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
    api.get("/customers", { params }).then((r) => setCustomers(r.data.customers)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const riskClass = {
    "Low Risk": "bg-emerald-50 text-emerald-700", "Medium Risk": "bg-amber-50 text-amber-700", "High Risk": "bg-rose-50 text-rose-700",
  };

  return (
    <div>
      <p className="eyebrow">Customer operations</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy">Customer records</h1>
      <p className="mt-2 text-sm text-slate-500">Search and filter prediction records created through the AI assessment workflow.</p>
      <div className="panel mt-7">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,1fr)_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17} /><input className="input !pl-10" placeholder="Search ID, segment, geography..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
          <select className="input" value={filters.risk_level} onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}><option value="">All risk levels</option><option>Low Risk</option><option>Medium Risk</option><option>High Risk</option></select>
          <select className="input" value={filters.geography} onChange={(e) => setFilters({ ...filters, geography: e.target.value })}><option value="">All geographies</option><option>France</option><option>Germany</option><option>Spain</option></select>
          <select className="input" value={filters.churn_status} onChange={(e) => setFilters({ ...filters, churn_status: e.target.value })}><option value="">All outcomes</option><option value="1">Likely churn</option><option value="0">Likely stay</option></select>
          <button onClick={load} className="btn-primary !px-4"><Filter size={17} /> Apply</button>
        </div>
      </div>

      <div className="panel mt-5 overflow-hidden !p-0">
        {loading ? <Loader /> : error ? <div className="p-6 text-rose-700">{error}</div> : customers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center"><Users size={40} className="text-slate-300" /><h3 className="mt-3 font-bold text-navy">No matching customer records</h3><p className="mt-2 text-sm text-slate-500">Run predictions to populate this operational view.</p></div>
        ) : (
          <div className="scrollbar overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Customer", "Profile", "Balance", "Probability", "Risk", "Segment", "Outcome", "Created"].map((head) => <th key={head} className="whitespace-nowrap px-5 py-4 font-bold">{head}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => <tr key={customer.id} className="hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-bold text-navy">{customer.full_name || `Assessment #${customer.id}`}</p>
                    <p className="text-xs text-slate-500">{customer.external_customer_id || `Ad-hoc · #${customer.id}`}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4"><p className="font-semibold">{customer.gender}, {customer.age}</p><p className="text-xs text-slate-500">{customer.geography} · Score {customer.credit_score}</p></td>
                  <td className="whitespace-nowrap px-5 py-4">${customer.balance.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-bold">{(customer.churn_probability * 100).toFixed(1)}%</td>
                  <td className="whitespace-nowrap px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskClass[customer.risk_category]}`}>{customer.risk_category}</span></td>
                  <td className="whitespace-nowrap px-5 py-4">{customer.customer_segment}</td>
                  <td className="whitespace-nowrap px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${customer.churn_prediction ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{customer.churn_prediction ? "Likely churn" : "Likely stay"}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
