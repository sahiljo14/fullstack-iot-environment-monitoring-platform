import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getExportURL } from "@/lib/api";

const PAGE_SIZE = 15;

function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DataTable({ data }) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return data;
    const q = filter.toLowerCase();
    return data.filter((d) => formatTs(d.timestamp).toLowerCase().includes(q));
  }, [data, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const downloadCSV = () => {
    window.open(getExportURL(), '_blank');
  };

  const ghostBtn = {
    fontSize: 13,
    fontWeight: 500,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    background: "var(--surface)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div className="es-card es-fade-in" style={{ display: "flex", flexDirection: "column", height: 480 }}>
      <div className="flex flex-wrap items-center justify-between" style={{ gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Recent Readings</h3>
        <div className="flex items-center" style={{ gap: 8 }}>
          <input
            type="text"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(0); }}
            placeholder="Filter by date…"
            style={{
              fontSize: 13,
              padding: "6px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: 6,
              background: "var(--surface)",
              color: "var(--text-primary)",
              outline: "none",
              width: 160,
            }}
          />
          <button onClick={downloadCSV} style={ghostBtn}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div
        className="es-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: 400,
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Timestamp", "Temp (°C)", "Humidity (%)", "Pressure (hPa)", "TVOC (ppb)", "eCO₂ (ppm)"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "var(--surface)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-tertiary)",
                    textAlign: i === 0 ? "left" : "right",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.id ?? idx}
                style={{
                  background: idx % 2 === 1 ? "var(--row-stripe)" : "transparent",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{formatTs(r.timestamp)}</td>
                <td className="es-mono" style={{ padding: "10px 16px", color: "var(--text-primary)", textAlign: "right" }}>{(+r.temperature).toFixed(2)}</td>
                <td className="es-mono" style={{ padding: "10px 16px", color: "var(--text-primary)", textAlign: "right" }}>{(+r.humidity).toFixed(1)}</td>
                <td className="es-mono" style={{ padding: "10px 16px", color: "var(--text-primary)", textAlign: "right" }}>{r.pressure != null ? (+r.pressure).toFixed(1) : "—"}</td>
                <td className="es-mono" style={{ padding: "10px 16px", color: "var(--text-primary)", textAlign: "right" }}>{r.tvoc ?? "—"}</td>
                <td className="es-mono" style={{ padding: "10px 16px", color: "var(--text-primary)", textAlign: "right" }}>{r.eco2 ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
                  No matching rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 12, fontSize: 12, color: "var(--text-tertiary)" }}>
        <span>Page {safePage + 1} of {totalPages}</span>
        <div className="flex" style={{ gap: 8 }}>
          <button
            disabled={safePage === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{ ...ghostBtn, opacity: safePage === 0 ? 0.4 : 1, cursor: safePage === 0 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            style={{ ...ghostBtn, opacity: safePage >= totalPages - 1 ? 0.4 : 1, cursor: safePage >= totalPages - 1 ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
