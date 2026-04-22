import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { Sparkline } from "./Sparkline";

export function MetricCard({ icon: Icon, label, value, unit, trend, spark, color, sparkId, dual }) {
  const trendDir = trend?.direction; // "up" | "down" | "flat"
  const trendColor =
    trendDir === "up" ? "var(--success-color)" :
    trendDir === "down" ? "var(--danger-color)" : "var(--text-tertiary)";
  const TrendIcon = trendDir === "up" ? ArrowUp : trendDir === "down" ? ArrowDown : ArrowRight;

  return (
    <div className="es-card es-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: 168 }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <span className="es-label">{label}</span>
        <Icon size={16} style={{ color }} />
      </div>

      {dual ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
            {dual[0].label}: <span style={{ color }}>{dual[0].value}</span>{" "}
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>{dual[0].unit}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
            {dual[1].label}: <span style={{ color }}>{dual[1].value}</span>{" "}
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>{dual[1].unit}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="es-stat">{value}</span>
          {unit && <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-secondary)" }}>{unit}</span>}
        </div>
      )}

      {trend && (
        <div className="flex items-center" style={{ gap: 4, marginTop: 8, fontSize: 12, color: trendColor }}>
          <TrendIcon size={12} />
          <span>{trend.label}</span>
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <Sparkline data={spark} color={color} gradientId={sparkId} />
      </div>
    </div>
  );
}
