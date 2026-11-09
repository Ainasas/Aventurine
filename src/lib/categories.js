export const ACCOUNTS = ["Nubank", "Inter", "Carteira", "Itau", "Bradesco"];

export const CATEGORIES = [
  { tag: "Salário", icon: "Briefcase", types: ["Ganho"], tone: "emerald" },
  { tag: "Freelance", icon: "Sparkles", types: ["Ganho"], tone: "violet" },
  { tag: "Reembolso", icon: "Undo2", types: ["Ganho"], tone: "sky" },
  { tag: "Alimentação", icon: "Utensils", types: ["Gasto"], tone: "amber" },
  { tag: "Transporte", icon: "Orbit", types: ["Gasto"], tone: "sky" },
  { tag: "Moradia", icon: "Home", types: ["Gasto"], tone: "fuchsia" },
  { tag: "Lazer", icon: "Gamepad2", types: ["Gasto"], tone: "violet" },
  { tag: "Saúde", icon: "HeartPulse", types: ["Gasto"], tone: "rose" },
  { tag: "Educação", icon: "GraduationCap", types: ["Gasto"], tone: "sky" },
  { tag: "Contas", icon: "Receipt", types: ["Gasto"], tone: "slate" },
  { tag: "Investimento", icon: "TrendingUp", types: ["Guardado"], tone: "emerald" },
  { tag: "Reserva", icon: "PiggyBank", types: ["Guardado"], tone: "sky" },
  { tag: "Outros", icon: "Tag", types: ["Ganho", "Gasto", "Guardado"], tone: "slate" },
];

const TONE_CLASS = {
  emerald: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/45",
  violet: "bg-violet-400/15 text-violet-100 ring-violet-300/45",
  sky: "bg-sky-400/15 text-sky-100 ring-sky-300/45",
  amber: "bg-amber-300/15 text-amber-100 ring-amber-200/45",
  fuchsia: "bg-fuchsia-400/15 text-fuchsia-100 ring-fuchsia-300/45",
  rose: "bg-rose-400/15 text-rose-100 ring-rose-300/45",
  slate: "bg-slate-300/10 text-slate-100 ring-slate-300/35",
};

export function categoriesFor(type) {
  return CATEGORIES.filter((category) => category.types.includes(type));
}

export function categoryByTag(tag) {
  return CATEGORIES.find((category) => category.tag === tag) ?? CATEGORIES.at(-1);
}

export function tagClassName(tag) {
  const tone = categoryByTag(tag).tone;
  return `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${TONE_CLASS[tone]}`;
}

export const TYPE_META = {
  Ganho: {
    label: "Ganho",
    chip: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/40",
    amount: "text-emerald-200",
  },
  Gasto: {
    label: "Gasto",
    chip: "bg-rose-400/15 text-rose-100 ring-rose-300/40",
    amount: "text-rose-200",
  },
  Guardado: {
    label: "Guardado",
    chip: "bg-sky-400/15 text-sky-100 ring-sky-300/40",
    amount: "text-sky-200",
  },
};
