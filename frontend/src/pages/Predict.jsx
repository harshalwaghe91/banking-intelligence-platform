import { useEffect, useState } from "react";
import {
  AlertCircle, BrainCircuit, Building2, CheckCircle2, CreditCard,
  Download, Lightbulb, Mail, Phone, RefreshCw, Search,
  ShieldCheck, Sparkles, Target, UserRound,
} from "lucide-react";
import api, { API_BASE_URL } from "../api";
import Loader from "../components/Loader";

const money = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
});

export default function Predict() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setDirectoryLoading(true);
      setError("");
      try {
        const { data } = await api.get("/customer-directory", {
          params: { search: query || undefined, limit: 20 },
        });
        setCustomers(data.customers);
        if (!selected && data.customers.length) setSelected(data.customers[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setDirectoryLoading(false);
      }
    }, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query]);

  const chooseCustomer = (customer) => {
    setSelected(customer);
    setResult(null);
    setError("");
  };

  const assess = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post(`/customer-directory/${selected.customer_id}/assess`);
      setSelected(data.customer);
      setResult(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setReporting(true);
    setError("");
    try {
      const { data } = await api.post("/generate-report", {
        customer: selected.model_features,
        prediction: result,
      });
      window.open(`${API_BASE_URL}${data.download_url}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    } finally {
      setReporting(false);
    }
  };

  const riskStyle = {
    "Low Risk": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Medium Risk": "bg-amber-50 text-amber-700 border-amber-200",
    "High Risk": "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div>
      <div className="mb-7">
        <p className="eyebrow">Relationship intelligence workspace</p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy">Customer churn assessment</h1>
        <p className="mt-2 text-sm text-slate-500">Find a customer in the bank directory, verify their profile, and run a traceable AI assessment.</p>
      </div>

      {error && <div className="mb-5 flex gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={18} className="shrink-0" /> {error}</div>}

      <div className="grid items-start gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="panel !p-0">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div><h2 className="font-bold text-navy">Customer directory</h2><p className="text-xs text-slate-500">Authoritative customer records</p></div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{customers.length}</span>
            </div>
            <label className="relative block">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={17} />
              <input className="input !pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, customer ID, account..." />
            </label>
          </div>
          <div className="scrollbar max-h-[650px] overflow-y-auto p-2">
            {directoryLoading ? <Loader label="Loading customers..." /> : customers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No customers match your search.</div>
            ) : customers.map((customer) => (
              <button type="button" key={customer.customer_id} onClick={() => chooseCustomer(customer)}
                className={`mb-1 w-full rounded-xl p-3 text-left transition ${selected?.customer_id === customer.customer_id ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "hover:bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${selected?.customer_id === customer.customer_id ? "bg-white/15" : "bg-blue-50 text-blue-700"}`}>
                    {customer.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{customer.full_name}</span>
                    <span className={`block truncate text-xs ${selected?.customer_id === customer.customer_id ? "text-blue-100" : "text-slate-500"}`}>{customer.customer_id} · {customer.masked_account}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-5">
          {!selected ? (
            <div className="panel flex min-h-[500px] flex-col items-center justify-center text-center">
              <UserRound size={42} className="text-slate-300" /><h2 className="mt-4 text-xl font-bold text-navy">Select a customer</h2>
              <p className="mt-2 text-sm text-slate-500">Choose a verified record before running an assessment.</p>
            </div>
          ) : (
            <>
              <section className="panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-extrabold text-white">
                      {selected.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-navy">{selected.full_name}</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700"><ShieldCheck size={12} /> Verified record</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{selected.customer_id} · {selected.account_status} · RM: {selected.relationship_manager}</p>
                    </div>
                  </div>
                  <button onClick={assess} disabled={loading} className="btn-primary">
                    {loading ? <><RefreshCw className="animate-spin" size={18} /> Assessing...</> : <><Sparkles size={18} /> Run AI assessment</>}
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[[Mail, "Email", selected.email], [Phone, "Phone", selected.phone], [CreditCard, "Account", selected.masked_account], [Building2, "Home branch", selected.branch]].map(([Icon, label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Icon size={14} /> {label}</div>
                      <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-slate-400">Banking profile used by the model</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {[
                      ["Credit score", selected.model_features.CreditScore], ["Location", selected.model_features.Geography],
                      ["Age", selected.model_features.Age], ["Tenure", `${selected.model_features.Tenure} years`],
                      ["Balance", money.format(selected.model_features.Balance)], ["Products", selected.model_features.NumOfProducts],
                      ["Credit card", selected.model_features.HasCrCard ? "Yes" : "No"], ["Active member", selected.model_features.IsActiveMember ? "Yes" : "No"],
                      ["Est. salary", money.format(selected.model_features.EstimatedSalary)], ["Last contact", selected.last_contact_at || "Not recorded"],
                    ].map(([label, value]) => <div key={label}><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-navy">{value}</p></div>)}
                  </div>
                </div>
              </section>

              {loading ? <div className="panel"><Loader label="Scoring customer and preparing explanations..." /></div> : !result ? (
                <div className="panel flex min-h-64 flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><BrainCircuit size={30} /></span>
                  <h2 className="mt-4 text-lg font-bold text-navy">Ready for assessment</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">The assessment is linked to {selected.customer_id} and saved to the audit-ready customer records panel.</p>
                </div>
              ) : (
                <section className="space-y-5">
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-navy to-blue-900 p-6 text-white shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Assessment complete</p><h2 className="mt-2 text-2xl font-bold">{result.churn_label}</h2><p className="mt-1 text-sm text-slate-300">{result.external_customer_id} · {result.customer_segment} · Audit #{result.customer_id}</p></div>
                      <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${riskStyle[result.risk_category]}`}>{result.risk_category}</span>
                    </div>
                    <div className="mt-7 flex items-end justify-between"><span className="text-sm text-slate-300">Churn probability</span><span className="text-4xl font-extrabold">{(result.churn_probability * 100).toFixed(1)}%</span></div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-rose-400 transition-all duration-700" style={{ width: `${result.churn_probability * 100}%` }} /></div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="panel">
                      <div className="flex items-center gap-2 text-blue-700"><Lightbulb size={19} /><h3 className="font-bold">Why this score?</h3></div>
                      <ul className="mt-4 space-y-3">{result.explainable_reasons.map((reason) => <li key={reason} className="flex gap-2 text-sm leading-5 text-slate-600"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-500" />{reason}</li>)}</ul>
                    </div>
                    <div className="panel">
                      <div className="flex items-center gap-2 text-violet-700"><Target size={19} /><h3 className="font-bold">Retention playbook</h3></div>
                      <ul className="mt-4 space-y-3">{result.retention_recommendations.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-bold text-violet-600">→</span>{item}</li>)}</ul>
                    </div>
                  </div>
                  <button onClick={generateReport} disabled={reporting} className="btn-primary w-full">{reporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}{reporting ? "Generating report..." : "Generate customer PDF report"}</button>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
