import { useId, useState } from "react";
import { Ban, Repeat, Trash2 } from "lucide-react";
import { ACCOUNTS, categoriesFor, categoryByTag, tagClassName, TYPE_META } from "../lib/categories";
import { formatBRL, formatMonth, parseAmount, roundMoney, shiftMonth } from "../lib/finance";
import CategoryIcon from "./CategoryIcon";
import GlassCard from "./GlassCard";

const KINDS = ["Parcela", "Assinatura"];
const TYPES = ["Gasto", "Ganho"];
const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-300/25 bg-slate-950/70 px-3 py-2.5 text-base text-white outline-none transition focus:border-sky-300";

export default function RecurringView({ finance }) {
  const { state, addRecurring, cancelRecurring, removeRecurring } = finance;
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const active = state.recurring.filter((item) => item.status === "active");
  const closed = state.recurring.filter((item) => item.status !== "active");
  const monthlyOut = roundMoney(
    active.filter((item) => item.type === "Gasto").reduce((total, item) => total + item.amount, 0),
  );
  const nextMonth = formatMonth(shiftMonth(state.currentMonth, 1));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-200 uppercase">Cobranças automáticas</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Parcelas e assinaturas</h2>
        </div>
        <p className="rounded-full border border-slate-300/25 bg-white/5 px-3 py-1.5 text-sm text-slate-100">
          Gastos recorrentes por mês: <span className="font-mono font-semibold text-white">{formatBRL(monthlyOut)}</span>
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-50">
          {notice}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <RecurringForm
            onSubmit={(input) => {
              addRecurring(input);
              setNotice(`${input.kind} "${input.description}" cadastrada e lançada neste mês.`);
            }}
          />
        </div>

        <div className="grid gap-6 lg:col-span-7">
          <GlassCard className="p-5">
            <h2 className="text-lg font-semibold text-white">Ativas ({active.length})</h2>
            {active.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300/25 px-4 py-8 text-center text-sm text-slate-300">
                Nenhuma parcela ou assinatura ativa.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-white/10">
                {active.map((item) => {
                  const meta = TYPE_META[item.type];
                  const isInstallment = item.kind === "Parcela";
                  const confirming = pendingId === item.id;
                  const remaining = isInstallment ? item.totalInstallments - item.currentInstallment : 0;
                  return (
                    <li key={item.id} className="py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${meta.chip}`}>
                              {item.kind}
                            </span>
                            <span className={tagClassName(item.categoryTag)}>
                              <CategoryIcon name={item.icon} className="h-3.5 w-3.5" />
                              {item.categoryTag}
                            </span>
                            <span className="rounded-full border border-slate-300/30 bg-slate-200/10 px-2 py-0.5 text-xs text-slate-100">
                              {item.account}
                            </span>
                          </div>
                          <p className="mt-2 truncate text-base font-medium text-white">{item.description}</p>
                          <p className="text-xs text-slate-300">
                            {isInstallment
                              ? `Parcela ${item.currentInstallment} de ${item.totalInstallments} · restam ${remaining} (${formatBRL(
                                  remaining * item.amount,
                                )}) · próxima em ${nextMonth}`
                              : `Cobrada todo mês até ser cancelada · próxima em ${nextMonth}`}
                          </p>
                          {isInstallment && (
                            <div
                              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={item.totalInstallments}
                              aria-valuenow={item.currentInstallment}
                              aria-label="Progresso das parcelas"
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                style={{ width: `${(item.currentInstallment / item.totalInstallments) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <p className={`font-mono text-lg font-bold ${meta.amount}`}>{formatBRL(item.amount)}</p>

                        <div className="flex gap-2">
                          {confirming ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  cancelRecurring(item.id);
                                  setPendingId(null);
                                  setNotice(`"${item.description}" cancelada. Não será lançada nos próximos meses.`);
                                }}
                                className="rounded-lg bg-rose-500/80 px-3 py-2 text-sm font-semibold text-white"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingId(null)}
                                className="rounded-lg border border-slate-300/25 px-3 py-2 text-sm text-slate-100"
                              >
                                Voltar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingId(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
                            >
                              <Ban className="h-4 w-4" aria-hidden="true" />
                              {isInstallment ? "Encerrar" : "Cancelar"}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>

          {closed.length > 0 && (
            <GlassCard className="p-5">
              <h2 className="text-lg font-semibold text-white">Encerradas ({closed.length})</h2>
              <ul className="mt-4 divide-y divide-white/10">
                {closed.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{item.description}</p>
                      <p className="text-xs text-slate-300">
                        {item.kind} · {item.status === "finished" ? "Quitada" : "Cancelada"} · {formatBRL(item.amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRecurring(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300/25 px-3 py-2 text-sm text-slate-100 transition hover:border-rose-300/50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-100">{legend}</legend>
      <div className={`grid gap-2 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((option) => {
          const activeOption = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={activeOption}
              onClick={() => onChange(option)}
              className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                activeOption
                  ? "border-violet-300/70 bg-violet-500/25 text-white shadow-[0_0_20px_-8px_rgba(139,92,246,0.9)]"
                  : "border-slate-300/20 bg-white/5 text-slate-200 hover:border-violet-300/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function RecurringForm({ onSubmit }) {
  const formId = useId();
  const [kind, setKind] = useState("Parcela");
  const [type, setType] = useState("Gasto");
  const [description, setDescription] = useState("");
  const [account, setAccount] = useState("Nubank");
  const [amount, setAmount] = useState("");
  const [categoryTag, setCategoryTag] = useState(categoriesFor("Gasto")[0].tag);
  const [total, setTotal] = useState("");
  const [current, setCurrent] = useState("1");
  const [errors, setErrors] = useState({});

  const options = categoriesFor(type);

  function changeType(nextType) {
    setType(nextType);
    const nextOptions = categoriesFor(nextType);
    if (!nextOptions.some((category) => category.tag === categoryTag)) {
      setCategoryTag(nextOptions[0].tag);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const parsed = parseAmount(amount);
    const totalNumber = Number(total);
    const currentNumber = Number(current);

    if (!description.trim()) nextErrors.description = "Informe uma descrição.";
    if (!account.trim()) nextErrors.account = "Informe a conta ou banco.";
    if (!Number.isFinite(parsed) || parsed <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    } else if (parsed > 99999999.99) {
      nextErrors.amount = "O valor passa do limite de R$ 99.999.999,99.";
    }
    if (kind === "Parcela") {
      if (!Number.isInteger(totalNumber) || totalNumber < 2 || totalNumber > 360) {
        nextErrors.total = "Informe de 2 a 360 parcelas.";
      } else if (!Number.isInteger(currentNumber) || currentNumber < 1 || currentNumber > totalNumber) {
        nextErrors.current = `A parcela atual deve ficar entre 1 e ${totalNumber}.`;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      kind,
      type,
      description: description.trim(),
      account: account.trim(),
      amount: parsed,
      categoryTag,
      icon: categoryByTag(categoryTag).icon,
      totalInstallments: kind === "Parcela" ? totalNumber : null,
      currentInstallment: kind === "Parcela" ? currentNumber : 1,
    });

    setDescription("");
    setAmount("");
    setTotal("");
    setCurrent("1");
    setErrors({});
  }

  const errorClass = "text-sm text-rose-200";

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Repeat className="h-5 w-5 text-violet-200" aria-hidden="true" />
        <h2 id={`${formId}-title`} className="text-lg font-semibold text-white">
          Nova parcela ou assinatura
        </h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit} aria-labelledby={`${formId}-title`} noValidate>
        <Toggle legend="Modalidade" options={KINDS} value={kind} onChange={setKind} />
        <Toggle legend="Tipo" options={TYPES} value={type} onChange={changeType} />

        <label className="grid gap-1.5 text-sm font-medium text-slate-100">
          Descrição
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={60}
            aria-invalid={Boolean(errors.description)}
            className={inputClass}
            placeholder={kind === "Parcela" ? "Ex.: Notebook, geladeira" : "Ex.: Netflix, academia"}
          />
          {errors.description && <span className={errorClass} role="alert">{errors.description}</span>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2 [&>label]:min-w-0">
          <label className="grid gap-1.5 text-sm font-medium text-slate-100">
            Conta / banco
            <input
              list={`${formId}-accounts`}
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              maxLength={40}
              aria-invalid={Boolean(errors.account)}
              className={inputClass}
            />
            <datalist id={`${formId}-accounts`}>
              {ACCOUNTS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {errors.account && <span className={errorClass} role="alert">{errors.account}</span>}
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-100">
            {kind === "Parcela" ? "Valor da parcela" : "Valor mensal"}
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={Boolean(errors.amount)}
              className={`${inputClass} font-mono`}
              placeholder="0,00"
            />
            {errors.amount && <span className={errorClass} role="alert">{errors.amount}</span>}
          </label>
        </div>

        {kind === "Parcela" && (
          <div className="grid gap-4 sm:grid-cols-2 [&>label]:min-w-0">
            <label className="grid gap-1.5 text-sm font-medium text-slate-100">
              Total de parcelas
              <input
                inputMode="numeric"
                value={total}
                onChange={(event) => setTotal(event.target.value)}
                aria-invalid={Boolean(errors.total)}
                className={`${inputClass} font-mono`}
                placeholder="12"
              />
              {errors.total && <span className={errorClass} role="alert">{errors.total}</span>}
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-100">
              Parcela deste mês
              <input
                inputMode="numeric"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                aria-invalid={Boolean(errors.current)}
                className={`${inputClass} font-mono`}
                placeholder="1"
              />
              {errors.current && <span className={errorClass} role="alert">{errors.current}</span>}
            </label>
          </div>
        )}

        <label className="grid gap-1.5 text-sm font-medium text-slate-100">
          Tag / categoria
          <select value={categoryTag} onChange={(event) => setCategoryTag(event.target.value)} className={inputClass}>
            {options.map((category) => (
              <option key={category.tag} value={category.tag}>
                {category.tag}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(217,70,239,0.9)] transition hover:brightness-110"
        >
          {kind === "Parcela" ? "Cadastrar parcelamento" : "Cadastrar assinatura"}
        </button>
      </form>
    </GlassCard>
  );
}