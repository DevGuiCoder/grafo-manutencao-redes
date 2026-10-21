import type { LucideIcon } from "lucide-react";
export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className={`metric-card ${accent ? "accent" : ""}`}>
      <Icon size={25} strokeWidth={1.6} />
      <div>
        <span>{label}</span>
        <strong className={String(value).length > 12 ? "metric-text" : ""}>
          {value}
        </strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
