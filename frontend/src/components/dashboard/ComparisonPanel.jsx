import { Cloud, Home } from "lucide-react";

function Row({ label, indoor, outdoor, last }) {
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "1.1fr 1fr 1fr",
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--border-color)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      <span className="es-mono" style={{ color: "var(--text-primary)", textAlign: "center" }}>{indoor}</span>
      <span className="es-mono" style={{ color: "var(--text-primary)", textAlign: "right" }}>{outdoor}</span>
    </div>
  );
}

function Badge({ tone, children }) {
  const map = {
    success: { color: "var(--success-color)", bg: "var(--success-soft)" },
    warning: { color: "var(--warning-color)", bg: "var(--warning-soft)" },
    accent:  { color: "var(--accent-color)",  bg: "var(--accent-soft)" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 6,
        background: map.bg,
        color: map.color,
      }}
    >
      {children}
    </span>
  );
}

function WeatherIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="10" r="4" fill="var(--warning-color)" opacity="0.85" />
      <path
        d="M17 17a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6.5A4 4 0 0 0 8 18h9a1 1 0 0 0 0-1Z"
        fill="var(--text-tertiary)"
        opacity="0.6"
      />
    </svg>
  );
}

export function ComparisonPanel({ indoor, outdoor }) {
  const tempDelta = +(outdoor.temperature - indoor.temperature).toFixed(1);
  const humidityDelta = +(indoor.humidity - outdoor.humidity).toFixed(0);
  const pressureDelta = +(indoor.pressure - outdoor.pressure).toFixed(0);

  return (
    <div className="es-card es-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 440 }}>
      <div style={{ marginBottom: 4 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Indoor vs Outdoor</h3>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
          Your room compared to local weather
        </p>
      </div>

      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "1.1fr 1fr 1fr",
          marginTop: 16,
          paddingBottom: 8,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <span />
        <span className="es-label flex items-center justify-center" style={{ gap: 6 }}>
          <Home size={12} /> Indoor
        </span>
        <span className="es-label flex items-center justify-end" style={{ gap: 6 }}>
          <Cloud size={12} /> Outdoor
        </span>
      </div>

      <div style={{ marginTop: 4 }}>
        <Row label="Temperature" indoor={`${indoor.temperature}°C`} outdoor={`${outdoor.temperature}°C`} />
        <Row label="Humidity" indoor={`${indoor.humidity}%`} outdoor={`${outdoor.humidity}%`} />
        <Row label="Pressure" indoor={`${indoor.pressure} hPa`} outdoor={`${outdoor.pressure} hPa`} />
        <Row label="Air (TVOC)" indoor={`${indoor.tvoc} ppb`} outdoor="—" />
        <Row label="Indoor eCO₂" indoor={`${indoor.eco2 ?? '—'} ppm`} outdoor="—" />
        <Row label="Outdoor AQI" indoor="—" outdoor={outdoor.aqi ? `${outdoor.aqi.index} – ${outdoor.aqi.label}` : "—"} />
        <Row label="Condition" indoor="—" outdoor={outdoor.condition} />
        <Row label="Wind" indoor="—" outdoor={`${outdoor.windSpeed} km/h`} last />
      </div>

      <div className="flex flex-wrap" style={{ gap: 8, marginTop: 16 }}>
        <Badge tone={tempDelta > 0 ? "success" : "warning"}>
          {Math.abs(tempDelta)}°C {tempDelta > 0 ? "cooler" : "warmer"} inside
        </Badge>
        <Badge tone={Math.abs(humidityDelta) > 20 ? "warning" : "accent"}>
          {Math.abs(humidityDelta)}% {humidityDelta > 0 ? "more" : "less"} humid inside
        </Badge>
        <Badge tone="accent">
          {Math.abs(pressureDelta)} hPa {pressureDelta >= 0 ? "higher" : "lower"} inside
        </Badge>
      </div>

      <div
        className="flex items-center"
        style={{
          gap: 10,
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid var(--border-color)",
          fontSize: 14,
          color: "var(--text-secondary)",
        }}
      >
        <WeatherIcon />
        <span>{outdoor.condition}, {outdoor.temperature}°C</span>
      </div>
    </div>
  );
}
