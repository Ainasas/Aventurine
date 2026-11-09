import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { History, LayoutDashboard, Repeat, Sparkles } from "lucide-react";
import Dashboard from "./components/Dashboard";
import HistoryView from "./components/HistoryView";
import Starfield from "./components/Starfield";
import { useFinance } from "./hooks/useFinance";
import { STORAGE_KEY } from "./lib/storage";
import RecurringView from "./components/RecurringView";


const TABS = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "recurring", label: "Recorrentes", icon: Repeat },
  { id: "history", label: "Histórico", icon: History },
];

export default function App() {
  const finance = useFinance();
  const [tab, setTab] = useState("dashboard");

  return (
    <MotionConfig reducedMotion="user">
      <div className="cosmos relative min-h-svh text-slate-100">
        <Starfield />
        <a
          href="#conteudo"
          className="absolute left-4 top-4 z-50 -translate-y-24 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-300/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-violet-300/40 bg-violet-500/20 p-2.5 text-violet-100 shadow-[0_0_24px_-8px_rgba(139,92,246,0.95)]">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Aventurine</h1>
                <p className="text-sm text-slate-300">Gerenciado por Nous · finanças do ciclo mensal</p>
              </div>
            </div>

            <nav className="flex gap-2" aria-label="Seções">
              {TABS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setTab(item.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                      active
                        ? "bg-violet-500/30 text-white ring-violet-300/60 shadow-[0_0_20px_-8px_rgba(139,92,246,0.95)]"
                        : "bg-white/5 text-slate-200 ring-slate-300/20 hover:ring-violet-300/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main id="conteudo" className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
               {tab === "dashboard" && <Dashboard finance={finance} />}
              {tab === "recurring" && <RecurringView finance={finance} />}
              {tab === "history" && <HistoryView months={finance.state.historicalMonths} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="mt-10 flex flex-col gap-3 border-t border-slate-300/15 pt-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <p>Dados deste navegador em {STORAGE_KEY}.</p>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
