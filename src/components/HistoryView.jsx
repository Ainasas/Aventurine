import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { TYPE_META, tagClassName } from "../lib/categories";
import { formatBRL, formatMonth, formatTimestamp } from "../lib/finance";
import CategoryIcon from "./CategoryIcon";
import GlassCard from "./GlassCard";

export default function HistoryView({ months }) {
  const newestId = months[0]?.id ?? null;
  const [openId, setOpenId] = useState(newestId);
  const [trackedNewestId, setTrackedNewestId] = useState(newestId);

  if (trackedNewestId !== newestId) {
    setTrackedNewestId(newestId);
    setOpenId(newestId);
  }

  if (!months.length) {
    return (
      <GlassCard className="px-6 py-16 text-center">
        <History className="mx-auto h-8 w-8 text-violet-200" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-semibold text-white">Nenhum mês arquivado</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          Finalize o ciclo aberto no painel para guardar os totais e os lançamentos aqui.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-fuchsia-200 uppercase">Arquivo da estação</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Histórico</h2>
      </div>

      {months.map((month) => {
        const open = openId === month.id;
        const panelId = `historico-${month.id}`;
        return (
          <GlassCard key={month.id} className="overflow-hidden">
            <button
              type="button"
              className="flex w-full flex-col gap-4 px-5 py-4 text-left sm:flex-row sm:items-center"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : month.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-white">{formatMonth(month.month)}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {month.transactions.length} lançamentos
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                <Total label="Ganhos" value={month.gains} tone="text-emerald-200" />
                <Total label="Gastos" value={month.expenses} tone="text-rose-200" />
                <Total label="Resultado" value={month.result ?? month.gains - month.expenses} tone="text-sky-200" />
                <Total label="Caixinha" value={month.vaultAfter ?? 0} tone="text-amber-200" />
              </dl>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-200 transition ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {open && (
              <div id={panelId} className="border-t border-white/10 px-5 py-4">
                <p className="mb-3 text-sm text-slate-300">
                  Resultado do mês {formatBRL(month.result ?? month.gains - month.expenses)} · caixinha ao fechar{" "}
                  {formatBRL(month.vaultAfter ?? 0)}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <caption className="sr-only">Lançamentos de {formatMonth(month.month)}</caption>
                    <thead className="text-xs tracking-wide text-slate-300 uppercase">
                      <tr>
                        <th scope="col" className="px-2 py-2 font-medium">Tipo</th>
                        <th scope="col" className="px-2 py-2 font-medium">Descrição</th>
                        <th scope="col" className="px-2 py-2 font-medium">Conta</th>
                        <th scope="col" className="px-2 py-2 font-medium">Tag</th>
                        <th scope="col" className="px-2 py-2 text-right font-medium">Valor</th>
                        <th scope="col" className="px-2 py-2 font-medium">Quando</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...month.transactions]
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((transaction) => {
                          const meta = TYPE_META[transaction.type] ?? TYPE_META.Gasto;
                          return (
                            <tr key={transaction.id} className="border-t border-white/10">
                              <td className="px-2 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${meta.chip}`}>
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-white">{transaction.description}</td>
                              <td className="px-2 py-3">
                                <span className="rounded-full border border-slate-300/30 bg-slate-200/10 px-2 py-0.5 text-xs text-slate-100">
                                  {transaction.account}
                                </span>
                              </td>
                              <td className="px-2 py-3">
                                <span className={tagClassName(transaction.categoryTag)}>
                                  <CategoryIcon name={transaction.icon} className="h-3.5 w-3.5" />
                                  {transaction.categoryTag}
                                </span>
                              </td>
                              <td className={`px-2 py-3 text-right font-mono font-semibold ${meta.amount}`}>
                                {formatBRL(transaction.amount)}
                              </td>
                              <td className="px-2 py-3 text-slate-300">{formatTimestamp(transaction.createdAt)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

function Total({ label, value, tone }) {
  return (
    <div>
      <dt className="text-[11px] tracking-wide text-slate-300 uppercase">{label}</dt>
      <dd className={`font-mono text-sm font-semibold ${value < 0 ? "text-rose-200" : tone}`}>{formatBRL(value)}</dd>
    </div>
  );
}
