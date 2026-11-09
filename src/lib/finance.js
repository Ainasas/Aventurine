const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthLabel = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function parseAmount(value) {
  const raw = String(value ?? "").trim().replace(/\s/g, "");
  if (!raw) return Number.NaN;

  let normalized = raw;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return Number.NaN;
  return roundMoney(amount);
}

export function formatBRL(value) {
  return money.format(roundMoney(value || 0));
}

export function amountToInput(value) {
  return roundMoney(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMonth(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  const label = monthLabel.format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(yearMonth, delta) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${nextMonth}`;
}

export function sumByType(transactions, type) {
  return roundMoney(
    transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + Number(transaction.amount), 0),
  );
}

export function computeMetrics(state) {
  const gains = sumByType(state.transactions, "Ganho");
  const expenses = sumByType(state.transactions, "Gasto");
  const available = roundMoney(gains - expenses);
  const closed = (state.historicalMonths ?? []).reduce(
    (total, month) => total + Number(month.result ?? Number(month.gains || 0) - Number(month.expenses || 0)),
    0,
  );
  const vault = roundMoney(Number(state.caixinhaBase || 0) + closed + available);

  return { gains, expenses, available, vault };
}

export function deriveSavedAmount(transactions) {
  return sumByType(transactions, "Guardado");
}

export function formatTimestamp(iso) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
