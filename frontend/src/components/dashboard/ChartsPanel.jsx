import { useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

const TABS = [
  { key: "all",         label: "All" },
  { key: "temperature", label: "Temperature" },
  { key: "humidity",    label: "Humidity" },
  { key: "pressure",    label: "Pressure" },
  { key: "air",         label: "Air Quality" },
];

const RANGES = [
  { key: "1H",  minutes: 60 },
  { key: "6H",  minutes: 360 },
  { key: "24H", minutes: 1440 },
  { key: "7D",  minutes: 10080 },
  { key: "30D", minutes: 43200 },
];

const RAW_COLORS_LIGHT = {
  temperature: "#EF4444",
  humidity:    "#2563EB",
  pressure:    "#8B5CF6",
  air:         "#059669",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "var(--shadow-card)",
        fontSize: 12,
        color: "var(--text-primary)",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between" style={{ gap: 16, marginTop: 2 }}>
          <span className="flex items-center" style={{ gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color, display: "inline-block" }} />
            <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{p.name || p.dataKey}</span>
          </span>
          <span className="es-mono" style={{ color: "var(--text-primary)" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartsPanel({ data }) {
  const [tab, setTab] = useState("all");
  const [range, setRange] = useState("24H");

  const formatted = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })),
    [data],
  );

  const axisTick = { fill: "var(--text-tertiary)", fontSize: 11 };

  return (
    <div className="es-card es-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 440 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between" style={{ gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Sensor Readings</h3>

        <div className="flex items-center" style={{ gap: 4 }}>
          {RANGES.map((r) => {
            const active = r.key === range;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: active ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                  background: active ? "var(--accent-color)" : "var(--surface)",
                  color: active ? "white" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {r.key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center es-no-scrollbar" style={{ gap: 20, borderBottom: "1px solid var(--border-color)", marginBottom: 16, overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                paddingBottom: 8,
                color: active ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: active ? "2px solid var(--accent-color)" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 320, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          {tab === "all" ? (
            <LineChart data={formatted} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} minTickGap={32} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-color)" }} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 8 }}
              />
              <Line type="monotone" name="Temperature" dataKey="temperature" stroke={RAW_COLORS_LIGHT.temperature} strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
              <Line type="monotone" name="Humidity"    dataKey="humidity"    stroke={RAW_COLORS_LIGHT.humidity}    strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
              <Line type="monotone" name="Pressure"    dataKey="pressure"    stroke={RAW_COLORS_LIGHT.pressure}    strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
              <Line type="monotone" name="eCO₂"        dataKey="eco2"        stroke={RAW_COLORS_LIGHT.air}         strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
            </LineChart>
          ) : (
            <AreaChart data={formatted} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${tab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RAW_COLORS_LIGHT[tab === "air" ? "air" : tab]} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={RAW_COLORS_LIGHT[tab === "air" ? "air" : tab]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={axisTick} axisLine={false} tickLine={false} minTickGap={32} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-color)" }} />
              <Area
                type="monotone"
                dataKey={tab === "air" ? "eco2" : tab}
                stroke={RAW_COLORS_LIGHT[tab === "air" ? "air" : tab]}
                strokeWidth={2}
                fill={`url(#fill-${tab})`}
                isAnimationActive
                animationDuration={800}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
        Showing data for the last <strong style={{ color: "var(--text-secondary)" }}>{range}</strong>
      </div>
    </div>
  );
}
