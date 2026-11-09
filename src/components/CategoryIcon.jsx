import {
  Briefcase,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  Orbit,
  PiggyBank,
  Receipt,
  Sparkles,
  Tag,
  TrendingUp,
  Undo2,
  Utensils,
} from "lucide-react";

const ICONS = {
  Briefcase,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  Orbit,
  PiggyBank,
  Receipt,
  Sparkles,
  Tag,
  TrendingUp,
  Undo2,
  Utensils,
};

export default function CategoryIcon({ name, className = "h-4 w-4" }) {
  const Icon = ICONS[name] ?? Tag;
  return <Icon className={className} aria-hidden="true" />;
}
