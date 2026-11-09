import { useState } from "react";
import { Orbit } from "lucide-react";
import { formatBRL, formatMonth, parseAmount } from "../lib/finance";
import ConfirmMonthModal from "./ConfirmMonthModal";
import GlassCard from "./GlassCard";
import MetricsGrid from "./MetricsGrid";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default function Dashboard({ finance }) {
  const { state, metrics } = finance;
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState("");
    const [editingVault, setEditingVault] = useState(false);
  const [vaultInput, setVaultInput] = useState("");

  function saveVault(event) {
    event.preventDefault();
    const value = parseAmount(vaultInput);
    if (!Number.isFinite(value) || value < 0) {
      setNotice("Informe um valor válido para a caixinha.");
      return;
    }
    finance.setCaixinhaBase(value);
    setEditingVault(false);
    setNotice("Saldo inicial da caixinha atualizado.");
  }

  function handleSubmit(input) {
    if (editing) {
      finance.updateTransaction(editing.id, input);
      setEditing(null);
      setNotice("Lançamento atualizado.");
    } else {
      finance.addTransaction(input);
      setFormKey((key) => key + 1);
      setNotice("Lançamento registrado.");
    }
  }

  function handleConfirm(rollover) {
    const summary = finance.finalizeMonth(rollover);
    setConfirmOpen(false);
    setEditing(null);
    setFormKey((key) => key + 1);
    if (!summary) return;
    const carried = `Caixinha: ${formatBRL(summary.vault)}.`;
    const recurringNote = summary.recurringCount
  ? ` ${summary.recurringCount} cobrança(s) recorrente(s) já lançada(s).`
  : "";
setNotice(`${formatMonth(summary.month)} arquivado. ${formatMonth(summary.nextMonth)} iniciado. ${carried}${recurringNote}`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-200 uppercase">Ciclo aberto</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{formatMonth(state.currentMonth)}</h2>
        </div>
      </div>

      <MetricsGrid metrics={metrics} />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/25 bg-amber-400/5 px-4 py-3 text-sm text-slate-100">
        <span>
          Saldo inicial da caixinha:{" "}
          <span className="font-mono font-semibold text-white">{formatBRL(state.caixinhaBase)}</span>
        </span>
        {editingVault ? (
          <form onSubmit={saveVault} className="flex flex-wrap gap-2">
            <input
              inputMode="decimal"
              autoFocus
              value={vaultInput}
              onChange={(event) => setVaultInput(event.target.value)}
              placeholder="0,00"
              aria-label="Saldo inicial da caixinha"
              className="w-32 rounded-lg border border-slate-300/25 bg-slate-950/70 px-3 py-2 font-mono text-white outline-none focus:border-sky-300"
            />
            <button type="submit" className="rounded-lg bg-violet-500/80 px-3 py-2 font-semibold text-white">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditingVault(false)}
              className="rounded-lg border border-slate-300/25 px-3 py-2 text-slate-100"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setVaultInput(String(state.caixinhaBase).replace(".", ","));
              setEditingVault(true);
            }}
            className="rounded-lg border border-amber-300/40 px-3 py-2 font-semibold text-amber-100 transition hover:bg-amber-400/10"
          >
            Editar saldo inicial
          </button>
        )}
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-50">
          {notice}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div id="lancamento" className="grid gap-6 lg:col-span-5">
          <TransactionForm
            key={editing?.id ?? `new-${formKey}`}
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={
              editing
                ? () => {
                    setEditing(null);
                    setNotice("Edição cancelada.");
                  }
                : undefined
            }
          />
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 p-2 text-fuchsia-100">
                <Orbit className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Finalizar mês</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  Arquiva os lançamentos, zera o ciclo e abre o mês seguinte. Você escolhe se a sobra sem dinheiro
                  guardado segue como saldo acumulado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="mt-4 w-full rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/15 px-4 py-3 text-sm font-semibold text-fuchsia-50 transition hover:bg-fuchsia-500/25 hover:shadow-[0_0_24px_-8px_rgba(217,70,239,0.9)]"
            >
              Finalizar mês
            </button>
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <TransactionList
            transactions={state.transactions}
            editingId={editing?.id}
            onEdit={(transaction) => {
              setEditing(transaction);
              setNotice("");
              document.getElementById("lancamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onDelete={(id) => {
              finance.deleteTransaction(id);
              if (editing?.id === id) setEditing(null);
              setNotice("Lançamento excluído.");
            }}
          />
        </div>
      </div>

      <ConfirmMonthModal
        open={confirmOpen}
        metrics={metrics}
        month={state.currentMonth}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
