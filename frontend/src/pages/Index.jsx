import { useEffect, useMemo, useRef, useState } from "react";
import { Droplet, Gauge, Thermometer, Wind } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartsPanel } from "@/components/dashboard/ChartsPanel";
import { ComparisonPanel } from "@/components/dashboard/ComparisonPanel";
import { DataTable } from "@/components/dashboard/DataTable";
import { ChatbotPanel } from "@/components/dashboard/ChatbotPanel";
import { SkeletonCard } from "@/components/dashboard/SkeletonCard";
import { generateReadings, outdoorWeather as mockWeather } from "@/lib/mockData";
import { fetchReadings, fetchWeather } from "@/lib/api";

const COLORS = {
  temperature: "#EF4444",
  humidity:    "#3B82F6",
  pressure:    "#8B5CF6",
  air:         "#059669",
};

function trendOf(curr, prev, unit = "") {
  const diff = +(curr - prev).toFixed(2);
  if (Math.abs(diff) < 0.05) return { direction: "flat", label: "Stable" };
  return {
    direction: diff > 0 ? "up" : "down",
    label: `${diff > 0 ? "+" : ""}${diff}${unit}`,
  };
}

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [readings, setReadings] = useState(() => generateReadings(60));
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [outdoor, setOutdoor] = useState(mockWeather);
  const [location, setLocation] = useState(mockWeather.location);
  const [live, setLive] = useState(false);
  const coordsRef = useRef({ lat: 18.52, lon: 73.86 });

  // Fetch weather on mount + refresh every 5 min (matches backend cache TTL)
  useEffect(() => {
    function applyWeather(lat, lon, data) {
      setOutdoor(data);
      setLocation(data.location || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
    }

    function doFetch(lat, lon, reason) {
      console.debug(`[EnviroSense] fetchWeather lat=${lat.toFixed(4)} lon=${lon.toFixed(4)} reason=${reason}`);
      fetchWeather(lat, lon)
        .then((data) => {
          console.debug(`[EnviroSense] weather received: ${data.location} temp=${data.temperature} hum=${data.humidity}% aqi=${data.aqi?.index ?? 'n/a'}`);
          applyWeather(lat, lon, data);
        })
        .catch((err) => {
          console.warn('[EnviroSense] weather fetch failed, keeping last outdoor state:', err?.message ?? err);
        });
    }

    function init() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            coordsRef.current = { lat, lon };
            doFetch(lat, lon, 'geolocation');
          },
          (err) => {
            console.warn(`[EnviroSense] geolocation denied/unavailable (${err?.message}), using Pune fallback`);
            doFetch(coordsRef.current.lat, coordsRef.current.lon, 'fallback-pune');
          },
        );
      } else {
        console.warn('[EnviroSense] geolocation not supported, using Pune fallback');
        doFetch(coordsRef.current.lat, coordsRef.current.lon, 'fallback-pune');
      }
    }

    init();
    // Poll every 5 minutes — backend caches 5 min so external API calls stay well under 60/min
    const weatherInterval = setInterval(() => {
      const { lat, lon } = coordsRef.current;
      doFetch(lat, lon, 'poll-5min');
    }, 5 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Initial fetch + polling every 3s
  useEffect(() => {
    let active = true;
    function load() {
      fetchReadings(120)
        .then((rows) => {
          if (!active || !rows || !rows.length) return;
          // Normalize: ensure numeric fields, add missing sensor fields
          const normalized = rows.map((r, i) => ({
            id: r.id ?? i,
            timestamp: r.timestamp,
            temperature: +r.temperature,
            humidity: +r.humidity,
            pressure: r.pressure != null ? +r.pressure : null,
            tvoc: r.tvoc != null ? +r.tvoc : null,
            eco2: r.eco2 != null ? +r.eco2 : null,
          }));
          // API returns DESC order; reverse to chronological for charts
          setReadings(normalized.slice().reverse());
          setLastUpdated(new Date());
          setLive(true);
          setLoading(false);
        })
        .catch(() => {
          if (active) {
            setLive(false);
            setLoading(false);
          }
        });
    }
    load();
    const i = setInterval(load, 3000);
    return () => { active = false; clearInterval(i); };
  }, []);

  const latest = readings[readings.length - 1];
  const previous = readings[readings.length - 2] || latest;

  const sparks = useMemo(() => {
    const last10 = readings.slice(-10);
    return {
      temperature: last10.map((r) => r.temperature),
      humidity: last10.map((r) => r.humidity),
      pressure: last10.map((r) => r.pressure ?? 1013),
      eco2: last10.map((r) => r.eco2 ?? 680),
    };
  }, [readings]);

  const airColor =
    (latest.tvoc ?? 0) < 200 ? COLORS.air :
    (latest.tvoc ?? 0) < 400 ? "#D97706" : "#DC2626";

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header location={location} lastUpdated={lastUpdated} live={live} />

      <main
        className="es-fade-in"
        style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 20px 32px" }}
      >
        {/* Metric cards */}
        <section
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}
        >
          {loading ? (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : (
            <>
              <MetricCard
                icon={Thermometer}
                label="Temperature"
                value={latest.temperature.toFixed(1)}
                unit="°C"
                trend={trendOf(latest.temperature, previous.temperature, "°")}
                spark={sparks.temperature}
                color={COLORS.temperature}
                sparkId="spark-temp"
              />
              <MetricCard
                icon={Droplet}
                label="Humidity"
                value={latest.humidity.toFixed(1)}
                unit="%"
                trend={trendOf(latest.humidity, previous.humidity, "%")}
                spark={sparks.humidity}
                color={COLORS.humidity}
                sparkId="spark-hum"
              />
              <MetricCard
                icon={Gauge}
                label="Pressure"
                value={latest.pressure != null ? Math.round(latest.pressure) : "—"}
                unit="hPa"
                trend={latest.pressure != null ? trendOf(latest.pressure, previous.pressure ?? latest.pressure, " hPa") : undefined}
                spark={sparks.pressure}
                color={COLORS.pressure}
                sparkId="spark-pres"
              />
              <MetricCard
                icon={Wind}
                label="Air Quality (TVOC / eCO₂)"
                dual={[
                  { label: "TVOC", value: latest.tvoc ?? "—", unit: "ppb" },
                  { label: "eCO₂", value: latest.eco2 ?? "—", unit: "ppm" },
                ]}
                spark={sparks.eco2}
                color={airColor}
                sparkId="spark-air"
              />
            </>
          )}
        </section>

        {/* Charts + Comparison */}
        <section
          className="grid"
          style={{ gridTemplateColumns: "minmax(0, 58fr) minmax(0, 42fr)", gap: 16, marginTop: 16 }}
        >
          {loading ? (
            <>
              <SkeletonCard height={440} />
              <SkeletonCard height={440} />
            </>
          ) : (
            <>
              <ChartsPanel data={readings} />
              <ComparisonPanel indoor={latest} outdoor={outdoor} />
            </>
          )}
        </section>

        {/* Table + Chatbot */}
        <section
          className="grid"
          style={{ gridTemplateColumns: "minmax(0, 58fr) minmax(0, 42fr)", gap: 16, marginTop: 16 }}
        >
          {loading ? (
            <>
              <SkeletonCard height={480} />
              <SkeletonCard height={480} />
            </>
          ) : (
            <>
              <DataTable data={[...readings].reverse()} />
              <ChatbotPanel latest={latest} outdoor={outdoor} />
            </>
          )}
        </section>
      </main>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1500px) {
          main { padding: 12px 14px 20px !important; }
          main > section { gap: 12px !important; }
          main > section + section { margin-top: 12px !important; }
        }
        @media (max-width: 1280px) {
          main { padding: 10px 12px 16px !important; }
          main > section { gap: 10px !important; }
          main > section + section { margin-top: 10px !important; }
        }
        @media (max-width: 1024px) {
          main > section { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          main { padding: 12px !important; }
          main > section:first-child { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}
