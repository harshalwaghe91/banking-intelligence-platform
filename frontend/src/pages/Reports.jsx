import { useEffect, useState } from "react";
import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import api, { API_BASE_URL } from "../api";
import Loader from "../components/Loader";

const sampleCustomer = {
  CreditScore: 650, Geography: "France", Gender: "Female", Age: 42, Tenure: 3,
  Balance: 125000, NumOfProducts: 1, HasCrCard: 1, IsActiveMember: 0, EstimatedSalary: 85000,
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/reports").then((r) => setReports(r.data.reports)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const generate = async () => {
    setGenerating(true); setError("");
    try { await api.post("/generate-report", { customer: sampleCustomer }); load(); }
    catch (err) { setError(err.message); }
    finally { setGenerating(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Export center</p><h1 className="mt-2 text-3xl font-extrabold text-navy">Intelligence reports</h1><p className="mt-2 text-sm text-slate-500">Generate and download decision-ready PDF briefs for customer reviews.</p></div>
        <button onClick={generate} disabled={generating} className="btn-primary">{generating ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />} Generate sample report</button>
      </div>
      {error && <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      <div className="panel mt-7">
        <div className="flex items-center justify-between"><div><h2 className="font-bold text-navy">Generated reports</h2><p className="mt-1 text-xs text-slate-500">PDF files stored by the backend service</p></div><button onClick={load} className="btn-secondary !p-2.5" aria-label="Refresh"><RefreshCw size={17} /></button></div>
        {loading ? <Loader /> : reports.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><FileText size={29} /></span><h3 className="mt-4 font-bold text-navy">No reports generated yet</h3><p className="mt-2 text-sm text-slate-500">Create one here or from a completed prediction.</p></div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.filename} className="flex flex-wrap items-center gap-4 py-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><FileText size={21} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-navy">{report.filename}</p><p className="mt-1 text-xs text-slate-500">{new Date(report.created_at * 1000).toLocaleString()} · {(report.size_bytes / 1024).toFixed(1)} KB</p></div>
                <a className="btn-secondary !px-3.5 !py-2 text-sm" href={`${API_BASE_URL}/download-report/${encodeURIComponent(report.filename)}`} target="_blank" rel="noreferrer"><Download size={16} /> Download</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
