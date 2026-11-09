import { useEffect, useId, useRef } from "react";
import { CheckCircle, X } from "lucide-react";
import { formatBRL, formatMonth } from "../lib/finance";

export default function ConfirmMonthModal({ open, metrics, month, onClose, onConfirm }) {
  if (!open) return null;
  return <MonthDialog metrics={metrics} month={month} onClose={onClose} onConfirm={onConfirm} />;
}

function MonthDialog({ metrics, month, onClose, onConfirm }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = [...dialogRef.current.querySelectorAll("button, input, [href], select, textarea")].filter(
      (element) => !element.disabled,
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

    const rows = [
    ["Ganhos", metrics.gains],
    ["Gastos", metrics.expenses],
    ["Resultado do mês", metrics.available],
    ["Caixinha após fechar", metrics.vault],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-300/30 bg-slate-950/95 p-5 shadow-[0_0_60px_-20px_rgba(139,92,246,0.9)] outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-200 uppercase">Fechamento de ciclo</p>
            <h2 id={titleId} className="mt-1 text-xl font-semibold text-white">
              Finalizar {formatMonth(month)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300/25 p-2 text-slate-100 hover:border-sky-300/50"
            aria-label="Cancelar fechamento"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-slate-200">
          O mês será arquivado, os lançamentos serão zerados e o resultado do mês vai para a caixinha.
        </p>

        <dl className="mt-4 divide-y divide-white/10 rounded-xl border border-slate-300/20">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-sm text-slate-200">{label}</dt>
              <dd className={`font-mono text-sm font-semibold ${value < 0 ? "text-rose-200" : "text-white"}`}>
                {formatBRL(value)}
              </dd>
            </div>
          ))}
        </dl>


        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/30 px-4 py-2.5 text-sm font-semibold text-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(217,70,239,0.95)]"
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Finalizar mês
          </button>
        </div>
      </div>
    </div>
  );
}
