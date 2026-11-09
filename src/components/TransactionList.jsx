import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { TYPE_META, tagClassName } from "../lib/categories";
import { formatBRL, formatTimestamp } from "../lib/finance";
import CategoryIcon from "./CategoryIcon";
import GlassCard from "./GlassCard";

const FILTERS = [
  { id: "Todos", label: "Todos" },
  { id: "Ganho", label: "Ganhos" },
  { id: "Gasto", label: "Gastos" },
];

export default function TransactionList({ transactions, editingId, onEdit, onDelete }) {
  const [filter, setFilter] = useState("Todos");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const ordered = [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = ordered.filter((transaction) => filter === "Todos" || transaction.type === filter);

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Lançamentos do mês</h2>
          <p className="mt-1 text-sm text-slate-300">{transactions.length} no ciclo atual</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
          {FILTERS.map((item) => {
            const count =
              item.id === "Todos"
                ? ordered.length
                : ordered.filter((transaction) => transaction.type === item.id).length;
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(item.id);
                  setPendingDeleteId(null);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  active
                    ? "bg-violet-500/30 text-white ring-violet-300/60 shadow-[0_0_16px_-6px_rgba(139,92,246,0.9)]"
                    : "bg-white/5 text-slate-200 ring-slate-300/20 hover:ring-violet-300/40"
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300/25 px-4 py-10 text-center text-sm text-slate-300">
          Nenhum lançamento neste filtro. Registre um ganho, gasto ou valor guardado.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10">
          <AnimatePresence initial={false}>
            {visible.map((transaction) => {
              const meta = TYPE_META[transaction.type];
              const confirming = pendingDeleteId === transaction.id;
              return (
                <motion.li
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center ${
                    editingId === transaction.id ? "rounded-xl bg-violet-500/10 px-3 ring-1 ring-violet-300/40" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${meta.chip}`}>
                        {meta.label}
                      </span>
                      <span className={tagClassName(transaction.categoryTag)}>
                        <CategoryIcon name={transaction.icon} className="h-3.5 w-3.5" />
                        {transaction.categoryTag}
                      </span>
                      <span className="rounded-full border border-slate-300/30 bg-slate-200/10 px-2 py-0.5 text-xs text-slate-100">
                        {transaction.account}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-base font-medium text-white">{transaction.description}</p>
                    <p className="text-xs text-slate-300">{formatTimestamp(transaction.createdAt)}</p>
                  </div>

                  <p className={`font-mono text-lg font-bold ${meta.amount}`}>{formatBRL(transaction.amount)}</p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300/25 px-3 py-2 text-sm text-slate-100 transition hover:border-sky-300/60 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Editar
                    </button>
                    {confirming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(transaction.id);
                            setPendingDeleteId(null);
                          }}
                          className="rounded-lg bg-rose-500/80 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="rounded-lg border border-slate-300/25 px-3 py-2 text-sm text-slate-100"
                        >
                          Voltar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(transaction.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Excluir
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </GlassCard>
  );
}
