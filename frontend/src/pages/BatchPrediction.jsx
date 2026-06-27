import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import api from "../api";

const required = ["CreditScore", "Geography", "Gender", "Age", "Tenure", "Balance", "NumOfProducts", "HasCrCard", "IsActiveMember", "EstimatedSalary"];

export default function BatchPrediction() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const chooseFile = (selected) => {
    setError(""); setComplete(false);
    if (!selected || !selected.name.toLowerCase().endsWith(".csv")) return setError("Choose a valid .csv file.");
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).filter(Boolean).slice(0, 6);
      const cols = lines[0]?.split(",").map((item) => item.trim()) || [];
      const missing = required.filter((column) => !cols.includes(column));
      if (missing.length) setError(`Missing required columns: ${missing.join(", ")}`);
      setHeaders(cols);
      setPreview(lines.slice(1).map((line) => line.split(",")));
    };
    reader.readAsText(selected);
  };

  const runBatch = async () => {
    if (!file || error) return;
    setLoading(true); setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await api.post("/batch-predict", body, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "customer_churn_predictions.csv"; anchor.click();
      URL.revokeObjectURL(url); setComplete(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <p className="eyebrow">Portfolio scoring</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy">Batch churn prediction</h1>
      <p className="mt-2 text-sm text-slate-500">Upload customer records, score the full portfolio, and download an enriched CSV.</p>

      <div className="mt-7 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
        <div className="panel">
          <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-7 text-center transition hover:border-blue-400 hover:bg-blue-50">
            <input type="file" accept=".csv" className="hidden" onChange={(e) => chooseFile(e.target.files[0])} />
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><UploadCloud size={30} /></span>
            <h2 className="mt-5 font-bold text-navy">Drop your customer CSV here</h2>
            <p className="mt-2 text-sm text-slate-500">or click to browse from your computer</p>
            <span className="mt-5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">CSV format · up to your API host limit</span>
          </label>
          {file && <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FileSpreadsheet className="text-emerald-600" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p></div><button onClick={() => { setFile(null); setPreview([]); setError(""); }}><X size={18} /></button></div>}
          {error && <div className="mt-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={18} className="shrink-0" />{error}</div>}
          {complete && <div className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={18} />Prediction file downloaded successfully.</div>}
          <button onClick={runBatch} disabled={!file || !!error || loading} className="btn-primary mt-5 w-full">{loading ? "Scoring portfolio..." : <><Download size={18} /> Run & download predictions</>}</button>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold text-navy">Data preview</h2><p className="mt-1 text-xs text-slate-500">Showing the first five rows</p></div>
            {preview.length > 0 && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{preview.length} rows previewed</span>}
          </div>
          {preview.length ? (
            <div className="scrollbar mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-3 font-bold">{header}</th>)}</tr></thead>
                <tbody>{preview.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-100">{row.map((cell, index) => <td key={index} className="whitespace-nowrap px-3 py-3 text-slate-600">{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-xl bg-slate-50 text-center"><FileSpreadsheet size={38} className="text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-500">Upload a CSV to inspect its columns and sample rows.</p></div>
          )}
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Required columns</p>
            <div className="mt-3 flex flex-wrap gap-2">{required.map((column) => <code key={column} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">{column}</code>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
