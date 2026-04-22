export function SkeletonCard({ height = 168 }) {
  return (
    <div className="es-card" style={{ minHeight: height, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="es-skeleton" style={{ height: 12, width: "40%" }} />
      <div className="es-skeleton" style={{ height: 28, width: "60%" }} />
      <div className="es-skeleton" style={{ flex: 1, marginTop: "auto" }} />
    </div>
  );
}
