import { useId, useState } from "react";
import { ACCOUNTS, categoriesFor, categoryByTag } from "../lib/categories";
import { amountToInput, parseAmount } from "../lib/finance";
import CategoryIcon from "./CategoryIcon";
import GlassCard from "./GlassCard";

const TYPES = ["Ganho", "Gasto"];

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const formId = useId();
  const [type, setType] = useState(initial?.type ?? "Gasto");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [account, setAccount] = useState(initial?.account ?? "Nubank");
  const [amount, setAmount] = useState(initial ? amountToInput(initial.amount) : "");
  const [categoryTag, setCategoryTag] = useState(
    initial?.categoryTag ?? categoriesFor(initial?.type ?? "Gasto")[0].tag,
  );
  const [errors, setErrors] = useState({});

  const options = categoriesFor(type);
  const selected = categoryByTag(categoryTag);

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

    if (!description.trim()) nextErrors.description = "Informe uma descrição.";
    if (!account.trim()) nextErrors.account = "Informe a conta ou banco.";
    if (!Number.isFinite(parsed) || parsed <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    } else if (parsed > 99999999.99) {
      nextErrors.amount = "O valor passa do limite de R$ 99.999.999,99.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      type,
      description: description.trim(),
      account: account.trim(),
      amount: parsed,
      categoryTag,
      icon: categoryByTag(categoryTag).icon,
    });
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={`${formId}-title`} className="text-lg font-semibold text-white">
          {initial ? "Editar lançamento" : "Novo lançamento"}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-sm text-violet-100">
          <CategoryIcon name={selected.icon} />
          {selected.tag}
        </span>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit} aria-labelledby={`${formId}-title`} noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-100">Tipo</legend>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeType(option)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                    active
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

        <label className="grid gap-1.5 text-sm font-medium text-slate-100">
          Descrição
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={80}
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? `${formId}-description-error` : undefined}
            className="rounded-xl border border-slate-300/25 bg-slate-950/70 px-3 py-2.5 text-base text-white outline-none transition focus:border-sky-300"
            placeholder="Ex.: Aluguel, salário, aporte"
          />
          {errors.description && (
            <span id={`${formId}-description-error`} className="text-sm text-rose-200" role="alert">
              {errors.description}
            </span>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2 [&>label]:min-w-0">
          <label className="grid gap-1.5 text-sm font-medium text-slate-100">
            Conta / banco
            <input
              list={`${formId}-accounts`}
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              maxLength={40}
              required
              aria-invalid={Boolean(errors.account)}
              aria-describedby={errors.account ? `${formId}-account-error` : undefined}
              className="w-full min-w-0 rounded-xl border border-slate-300/25 bg-slate-950/70 px-3 py-2.5 text-base text-white outline-none transition focus:border-sky-300"
              placeholder="Nubank, Inter, Carteira"
            />
            <datalist id={`${formId}-accounts`}>
              {ACCOUNTS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {errors.account && (
              <span id={`${formId}-account-error`} className="text-sm text-rose-200" role="alert">
                {errors.account}
              </span>
            )}
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-100">
            Valor
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? `${formId}-amount-error` : undefined}
              className="w-full min-w-0 rounded-xl border border-slate-300/25 bg-slate-950/70 px-3 py-2.5 font-mono text-base text-white outline-none transition focus:border-sky-300"
              placeholder="0,00"
            />
            {errors.amount && (
              <span id={`${formId}-amount-error`} className="text-sm text-rose-200" role="alert">
                {errors.amount}
              </span>
            )}
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-slate-100">
          Tag / categoria
          <select
            value={categoryTag}
            onChange={(event) => setCategoryTag(event.target.value)}
            className="w-full min-w-0 rounded-xl border border-slate-300/25 bg-slate-950/70 px-3 py-2.5 text-base text-white outline-none transition focus:border-sky-300"
          >
            {options.map((category) => (
              <option key={category.tag} value={category.tag}>
                {category.tag}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(217,70,239,0.9)] transition hover:brightness-110"
          >
            {initial ? "Salvar edição" : "Registrar lançamento"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300/30 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-300/60"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
