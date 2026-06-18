import { cn } from "@/lib/classnames";

const toneMap = {
  green: "bg-brand-100 text-brand-800",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-cyan-100 text-cyan-800",
  red: "bg-rose-100 text-rose-800"
};

export function Badge({
  children,
  tone = "slate"
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", toneMap[tone])}>{children}</span>;
}
