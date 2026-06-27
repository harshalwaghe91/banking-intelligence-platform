import { ArrowRight, BrainCircuit, Cloud, Code2, Database, GitBranch, Landmark, Rocket, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const workflow = [
  ["01", "Ingest", "Validate customer profiles or batch CSV records."],
  ["02", "Transform", "Encode categories and scale numerical behavior."],
  ["03", "Predict", "Compare trained classifiers and score churn probability."],
  ["04", "Explain", "Translate model contributions into practical reasons."],
  ["05", "Act", "Segment the customer and recommend retention actions."],
];

export default function About() {
  return (
    <div>
      <p className="eyebrow">Platform blueprint</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy">About BankIQ</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">A production-shaped portfolio project demonstrating how machine learning can become an understandable, usable decision product—not merely a notebook model.</p>

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="panel">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><Landmark size={23} /></span>
          <h2 className="mt-5 text-xl font-bold text-navy">The problem</h2>
          <p className="mt-3 leading-7 text-slate-600">Banks often recognize churn only after the relationship is lost. Customer signals live across product usage, activity, demographics, tenure, and balance—but frontline teams need one clear answer: who needs attention, why, and what should we do?</p>
          <p className="mt-3 leading-7 text-slate-600">BankIQ converts those signals into explainable risk assessments, portfolio analytics, operational segments, and personalized retention playbooks.</p>
        </div>
        <div className="rounded-2xl bg-ink p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Core use cases</p>
          <div className="mt-5 space-y-3">
            {["Prioritize relationship-manager outreach", "Design targeted retention campaigns", "Monitor portfolio churn patterns", "Enrich CRM customer records", "Generate auditable customer briefs"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><ShieldCheck size={17} className="text-cyan-400" />{item}</div>)}
          </div>
        </div>
      </section>

      <section className="panel mt-6">
        <p className="eyebrow">Machine learning workflow</p>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {workflow.map(([number, title, text], index) => <div key={title} className="relative rounded-xl bg-slate-50 p-4"><span className="text-xs font-extrabold text-blue-600">{number}</span><h3 className="mt-3 font-bold text-navy">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>{index < workflow.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden text-blue-300 md:block" size={18} />}</div>)}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h2 className="text-lg font-bold text-navy">Technology stack</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[["React + Vite", Code2], ["FastAPI", Rocket], ["scikit-learn", BrainCircuit], ["SQLite", Database], ["Recharts", GitBranch], ["Vercel + Render", Cloud]].map(([name, Icon]) => <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-semibold text-slate-700"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={17} /></span>{name}</div>)}
          </div>
        </div>
        <div className="panel">
          <h2 className="text-lg font-bold text-navy">Deployment architecture</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Frontend · Vercel</p><p className="mt-2 text-sm text-slate-600">React SPA communicates with the API through a configurable environment URL.</p></div>
            <div className="mx-auto h-5 w-px bg-blue-200" />
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Backend · Render</p><p className="mt-2 text-sm text-slate-600">FastAPI serves model inference, analytics, SQLite records, CSV exports, and PDF files.</p></div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-7 text-white">
        <h2 className="text-2xl font-bold">Future scope</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Add authenticated roles, model monitoring, feature drift alerts, CRM integrations, event-stream scoring, campaign outcome feedback, fairness audits, and cloud object storage for durable reports.</p>
        <Link to="/predict" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700">Try the model <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
