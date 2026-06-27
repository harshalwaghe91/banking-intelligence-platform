import { ArrowRight, Landmark, Menu, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ dashboard = false }) {
  return (
    <header className={`${dashboard ? "sticky top-0 z-20 border-b border-slate-200 bg-white/90" : "absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-ink/30"} backdrop-blur-xl`}>
      <div className={`${dashboard ? "max-w-none" : "mx-auto max-w-7xl"} flex h-16 items-center justify-between px-4 sm:px-6`}>
        <Link to="/" className={`flex items-center gap-2.5 font-bold ${dashboard ? "text-navy" : "text-white"}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
            <Landmark size={19} />
          </span>
          <span className="font-[Manrope] text-lg">Bank<span className="text-blue-500">IQ</span></span>
        </Link>
        {dashboard ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Intelligence online
            </span>
            <Link to="/predict" className="btn-primary !px-3.5 !py-2 text-sm">New prediction</Link>
          </div>
        ) : (
          <nav className="flex items-center gap-3">
            <a href="#features" className="hidden px-3 py-2 text-sm font-medium text-slate-300 hover:text-white md:block">Capabilities</a>
            <Link to="/about" className="hidden px-3 py-2 text-sm font-medium text-slate-300 hover:text-white md:block">About</Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-blue-50">
              Open platform <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
