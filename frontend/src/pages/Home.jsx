import {
  ArrowRight, BarChart3, BrainCircuit, CheckCircle2, FileText,
  Layers3, ShieldCheck, Sparkles, Target, Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: BrainCircuit, title: "Predictive churn scoring", text: "Score every customer with a probability, clear risk tier, and outcome." },
  { icon: Sparkles, title: "Explainable intelligence", text: "Turn model signals into plain-language reasons your team can act on." },
  { icon: Layers3, title: "Behavioral segmentation", text: "Discover loyal, premium, new, and at-risk customer groups." },
  { icon: Target, title: "Next-best retention action", text: "Generate tailored, behavior-aware recommendations in seconds." },
  { icon: BarChart3, title: "Portfolio analytics", text: "Monitor churn patterns across geography, age, products, and activity." },
  { icon: FileText, title: "Decision-ready reports", text: "Export polished PDF intelligence briefs and batch prediction files." },
];

export default function Home() {
  return (
    <div className="bg-white">
      <section className="hero-grid relative overflow-hidden bg-ink pb-24 pt-32 text-white">
        <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-cyan-300">
              <Sparkles size={14} /> Customer intelligence, made actionable
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.06] sm:text-6xl">
              Know who might leave.
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Know exactly what to do next.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              BankIQ unifies churn prediction, explainable AI, customer segmentation, and retention strategy in one decision workspace for modern banking teams.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/predict" className="btn-primary">Analyze a customer <ArrowRight size={18} /></Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">View analytics</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-400">
              {["Explainable scoring", "Portfolio analytics", "PDF reporting"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-400" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="panel-dark shadow-2xl shadow-blue-950/50">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Live intelligence</p>
                  <h3 className="mt-1 text-lg font-bold">Customer risk overview</h3>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Model active</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[["Churn probability", "78.4%", "text-rose-300"], ["Customer segment", "At-Risk", "text-amber-300"], ["Risk level", "High Risk", "text-rose-300"], ["Recommended actions", "4 ready", "text-cyan-300"]].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[.04] p-4">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[.04] p-4">
                <div className="flex justify-between text-xs"><span className="text-slate-400">Churn likelihood</span><span className="font-bold text-rose-300">78.4%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-400 to-rose-500" /></div>
              </div>
              <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Next best action</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Prioritize a relationship-manager call and offer premium fee benefits within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50 py-7">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {[["5K+", "customer profiles"], ["4", "behavioral segments"], ["10", "intelligence dimensions"], ["< 1 sec", "typical prediction"]].map(([value, label]) => (
            <div key={label}><p className="text-2xl font-extrabold text-navy">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p></div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">A complete intelligence loop</p>
          <h2 className="mt-3 text-4xl font-extrabold text-navy">From customer signal to retention action.</h2>
          <p className="mt-4 leading-7 text-slate-600">A professional decision layer for analysts, relationship managers, and customer success leaders.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-glow">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon size={23} /></span>
              <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-200">Ready to explore?</p>
            <h2 className="mt-3 text-3xl font-extrabold">Turn churn risk into customer opportunity.</h2>
            <p className="mt-3 max-w-2xl text-blue-100">Run your first explainable prediction and receive a personalized retention playbook.</p>
          </div>
          <Link to="/predict" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 lg:mt-0">Start predicting <ArrowRight size={18} /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 BankIQ. AI-powered banking intelligence.</p>
          <p className="flex items-center gap-2"><ShieldCheck size={16} /> Built for transparent, human-reviewed decisions.</p>
        </div>
      </footer>
    </div>
  );
}
