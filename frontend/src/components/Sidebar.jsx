import {
  BarChart3, BrainCircuit, FileBarChart, Info, LayoutDashboard,
  Landmark, Layers3, ShieldCheck, UploadCloud, Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Analytics", icon: LayoutDashboard },
  { to: "/predict", label: "AI Prediction", icon: BrainCircuit },
  { to: "/batch", label: "Batch Prediction", icon: UploadCloud },
  { to: "/segments", label: "Segments", icon: Layers3 },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin", label: "Customers", icon: Users },
  { to: "/about", label: "About Platform", icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400"><Landmark size={19} /></span>
        <span className="font-[Manrope] text-lg font-bold">Bank<span className="text-cyan-400">IQ</span></span>
      </div>
      <div className="px-4 pt-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Intelligence workspace</p>
      </div>
      <nav className="mt-3 flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="m-4 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-cyan-400/5 p-4">
        <ShieldCheck className="mb-3 text-cyan-400" size={24} />
        <p className="text-sm font-bold">Human-centered AI</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Explainable insights designed to support—not replace—banking teams.</p>
      </div>
    </aside>
  );
}
