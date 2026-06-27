import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import BatchPrediction from "./pages/BatchPrediction";
import Dashboard from "./pages/Dashboard";
import Segmentation from "./pages/Segmentation";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import About from "./pages/About";
import { BarChart3, BrainCircuit, Layers3, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-50">
      {isHome ? (
        <>
          <Navbar />
          <Home />
        </>
      ) : (
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 lg:ml-64">
            <Navbar dashboard />
            <div className="mx-auto max-w-[1500px] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8">
              <Routes>
                <Route path="/predict" element={<Predict />} />
                <Route path="/batch" element={<BatchPrediction />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/segments" element={<Segmentation />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </div>
            <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur lg:hidden">
              {[
                ["/dashboard", "Analytics", BarChart3],
                ["/predict", "Predict", BrainCircuit],
                ["/segments", "Segments", Layers3],
                ["/admin", "Customers", Users],
              ].map(([to, label, Icon]) => (
                <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
          </main>
        </div>
      )}
      {isHome && (
        <Routes>
          <Route path="/" element={null} />
        </Routes>
      )}
    </div>
  );
}
