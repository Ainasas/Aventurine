import { motion } from "framer-motion";
import { formatBRL } from "../lib/finance";
import GlassCard from "./GlassCard";
import { Archive, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const CARDS = [
  {
    key: "gains",
    label: "Ganhos do Mês",
    hint: "Soma dos lançamentos do tipo Ganho",
    icon: TrendingUp,
    accent: "text-emerald-200",
    glow: "shadow-[0_0_32px_-12px_rgba(52,211,153,0.8)]",
    span: "xl:col-span-2",
  },
  {
    key: "expenses",
    label: "Gastos do Mês",
    hint: "Soma dos lançamentos do tipo Gasto",
    icon: TrendingDown,
    accent: "text-rose-200",
    glow: "shadow-[0_0_32px_-12px_rgba(251,113,133,0.8)]",
    span: "xl:col-span-2",
  },
  {
    key: "available",
    label: "Resultado do Mês",
    hint: "Ganhos − gastos. Vai para a caixinha ao finalizar o mês",
    icon: Wallet,
    accent: "text-sky-200",
    glow: "shadow-[0_0_32px_-12px_rgba(56,189,248,0.8)]",
    span: "xl:col-span-2",
  },
  {
    key: "vault",
    label: "Caixinha (total)",
    hint: "Saldo inicial + meses fechados + resultado do mês atual",
    icon: Archive,
    accent: "text-amber-200",
    glow: "shadow-[0_0_32px_-12px_rgba(251,191,36,0.7)]",
    span: "sm:col-span-2 xl:col-span-6",
  },
];

export default function MetricsGrid({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        const tone = value < 0 ? "text-rose-200" : card.accent;

        return (
          <motion.div
            key={card.key}
            className={card.span}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <GlassCard className={`h-full p-4 ${card.glow}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{card.label}</p>
                <span className="rounded-full border border-slate-300/25 bg-white/5 p-2 text-slate-100">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className={`mt-4 font-mono text-2xl font-bold tracking-tight sm:text-3xl ${tone}`}>
                {formatBRL(value)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{card.hint}</p>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
