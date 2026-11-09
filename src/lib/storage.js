import { deriveSavedAmount, roundMoney } from "./finance";

export const STORAGE_KEY = "aventurine.finance.v2";

const START_MONTH = "2026-11";

function createInitialState() {
  return {
    currentMonth: START_MONTH,
    previousBalance: 0,
    savedAmount: 0,
    transactions: [],
    historicalMonths: [],
    recurring: [],
    caixinhaBase: 0,
  };
}

function isTransaction(value) {
  return (
    value &&
    typeof value.id === "string" &&
    (value.type === "Ganho" || value.type === "Gasto" || value.type === "Guardado") &&
    typeof value.description === "string" &&
    typeof value.account === "string" &&
    Number.isFinite(Number(value.amount)) &&
    typeof value.categoryTag === "string" &&
    typeof value.icon === "string"
  );
}

function isState(value) {
  return (
    value &&
    typeof value.currentMonth === "string" &&
    /^\d{4}-\d{2}$/.test(value.currentMonth) &&
    Number.isFinite(Number(value.previousBalance)) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isTransaction) &&
    Array.isArray(value.historicalMonths)
  );
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!isState(parsed)) return createInitialState();
        return {
      ...parsed,
      previousBalance: roundMoney(parsed.previousBalance),
      savedAmount: deriveSavedAmount(parsed.transactions),
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
      caixinhaBase: roundMoney(parsed.caixinhaBase || 0),
      transactions: parsed.transactions.map((transaction) => ({
        ...transaction,
        amount: roundMoney(transaction.amount),
      })),
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // armazenamento cheio ou bloqueado: o app continua funcionando em memória
  }
}