import { useEffect, useState } from "react";
import { computeMetrics, deriveSavedAmount, roundMoney, shiftMonth } from "../lib/finance";
import { loadState, saveState } from "../lib/storage";

function withSaved(state) {
  return { ...state, savedAmount: deriveSavedAmount(state.transactions) };
}

function chargeLabel(item, number) {
  return item.kind === "Parcela"
    ? `${item.description} (${number}/${item.totalInstallments})`
    : `${item.description} (assinatura)`;
}

function buildCharge(item, number) {
  return {
    id: crypto.randomUUID(),
    type: item.type,
    description: chargeLabel(item, number),
    account: item.account,
    amount: item.amount,
    categoryTag: item.categoryTag,
    icon: item.icon,
    createdAt: new Date().toISOString(),
    recurringId: item.id,
  };
}

// Gera a cobrança do próximo mês para cada recorrência ativa.
function advanceRecurring(items) {
  const charges = [];
  const updated = items.map((item) => {
    if (item.status !== "active") return item;
    const number = item.currentInstallment + 1;
    charges.push(buildCharge(item, item.kind === "Parcela" ? number : item.currentInstallment));
    const finished = item.kind === "Parcela" && number >= item.totalInstallments;
    return { ...item, currentInstallment: number, status: finished ? "finished" : "active" };
  });
  return { items: updated, charges };
}

export function useFinance() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  function addTransaction(input) {
    const transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      description: input.description,
      account: input.account,
      amount: roundMoney(input.amount),
      categoryTag: input.categoryTag,
      icon: input.icon,
      createdAt: new Date().toISOString(),
    };

    setState((current) =>
      withSaved({ ...current, transactions: [transaction, ...current.transactions] }),
    );
  }

  function updateTransaction(id, input) {
    setState((current) =>
      withSaved({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                type: input.type,
                description: input.description,
                account: input.account,
                amount: roundMoney(input.amount),
                categoryTag: input.categoryTag,
                icon: input.icon,
              }
            : transaction,
        ),
      }),
    );
  }

  function deleteTransaction(id) {
    setState((current) =>
      withSaved({
        ...current,
        transactions: current.transactions.filter((transaction) => transaction.id !== id),
      }),
    );
  }

  function addRecurring(input) {
    setState((current) => {
      const isInstallment = input.kind === "Parcela";
      const item = {
        id: crypto.randomUUID(),
        kind: input.kind,
        type: input.type,
        description: input.description,
        account: input.account,
        amount: roundMoney(input.amount),
        categoryTag: input.categoryTag,
        icon: input.icon,
        totalInstallments: isInstallment ? input.totalInstallments : null,
        currentInstallment: isInstallment ? input.currentInstallment : 1,
        startMonth: current.currentMonth,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      const finished = isInstallment && item.currentInstallment >= item.totalInstallments;
      const charge = buildCharge(item, item.currentInstallment);

      return withSaved({
        ...current,
        transactions: [charge, ...current.transactions],
        recurring: [{ ...item, status: finished ? "finished" : "active" }, ...current.recurring],
      });
    });
  }

  function cancelRecurring(id) {
    setState((current) => ({
      ...current,
      recurring: current.recurring.map((item) =>
        item.id === id && item.status === "active"
          ? { ...item, status: "canceled", canceledAt: new Date().toISOString() }
          : item,
      ),
    }));
  }

  function removeRecurring(id) {
    setState((current) => ({
      ...current,
      recurring: current.recurring.filter((item) => item.id !== id || item.status === "active"),
    }));
  }


  function setCaixinhaBase(value) {
    setState((current) => ({ ...current, caixinhaBase: roundMoney(value) }));
  }  

    function finalizeMonth() {
    const sourceMonth = state.currentMonth;
    const metrics = computeMetrics(state);
    const summary = {
      month: sourceMonth,
      nextMonth: shiftMonth(sourceMonth, 1),
      result: metrics.available,
      vault: metrics.vault,
      recurringCount: state.recurring.filter((item) => item.status === "active").length,
    };

    setState((current) => {
      if (current.currentMonth !== sourceMonth) return current;

      const archive = {
        id: crypto.randomUUID(),
        month: current.currentMonth,
        closedAt: new Date().toISOString(),
        gains: metrics.gains,
        expenses: metrics.expenses,
        result: metrics.available,
        vaultAfter: metrics.vault,
        transactions: current.transactions.map((transaction) => ({ ...transaction })),
      };

      const { items, charges } = advanceRecurring(current.recurring);

      return {
        currentMonth: summary.nextMonth,
        previousBalance: 0,
        savedAmount: 0,
        transactions: charges,
        historicalMonths: [archive, ...current.historicalMonths],
        recurring: items,
        caixinhaBase: current.caixinhaBase,
      };
    });

    return summary;
  }

  return {
    state,
    metrics: computeMetrics(state),
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurring,
    cancelRecurring,
    removeRecurring,
    finalizeMonth,
    setCaixinhaBase,
  };
}