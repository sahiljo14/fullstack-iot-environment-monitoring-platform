import { useEffect, useState } from "react";
import { MapPin, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="26" height="26" rx="7" fill="var(--accent-color)" />
      <path
        d="M9 17c0-4 3-7 7-7 1.2 0 2.2.2 3 .6-.4 3.8-3.4 6.8-7.2 7.2-.4-.2-.8-.5-1.1-.8C9.9 16.5 9 17 9 17Z"
        fill="white"
        opacity="0.95"
      />
      <path d="M10 18c2-1.5 4-3 6-5" stroke="var(--accent-color)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Header({ location, lastUpdated, live = true }) {
  const { theme, toggle } = useTheme();
  const [, force] = useState(0);

  useEffect(() => {
    const i = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
  const rel = seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;

  return (
    <header
      style={{
        height: 64,
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--border-color)",
      }}
      className="sticky top-0 z-30"
    >
      <div className="mx-auto flex h-full items-center justify-between" style={{ maxWidth: 1440, padding: "0 24px" }}>
        <div className="flex items-center gap-3">
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>EnviroSense</span>
        </div>

        <div className="flex items-center" style={{ gap: 16 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span
              className={live ? "es-pulse-dot" : ""}
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "9999px",
                backgroundColor: live ? "var(--success-color)" : "var(--danger-color)",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: live ? "var(--success-color)" : "var(--danger-color)" }}>
              {live ? "Live" : "Offline"}
            </span>
          </div>

          <div className="hidden sm:flex items-center" style={{ gap: 4, fontSize: 13, color: "var(--text-secondary)" }}>
            <MapPin size={13} style={{ color: "var(--text-tertiary)" }} />
            <span>{location}</span>
          </div>

          <span className="hidden md:inline" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            Updated {rel}
          </span>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
