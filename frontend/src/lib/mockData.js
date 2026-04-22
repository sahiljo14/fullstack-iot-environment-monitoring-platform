// Deterministic-ish noise for nicer-looking series
function noise(i, base, amp, freq = 0.18) {
  return base + Math.sin(i * freq) * amp + (Math.cos(i * freq * 2.3) * amp) / 3;
}

export function generateReadings(count = 60) {
  const now = Date.now();
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * 2000); // every 2s
    out.push({
      id: count - i,
      timestamp: t.toISOString(),
      temperature: +noise(i, 27.5, 1.2).toFixed(2),
      humidity: +noise(i, 55, 4, 0.12).toFixed(1),
      pressure: +noise(i, 1013, 2.5, 0.09).toFixed(1),
      tvoc: Math.max(0, Math.round(noise(i, 120, 40, 0.22))),
      eco2: Math.max(400, Math.round(noise(i, 680, 120, 0.16))),
    });
  }
  return out;
}

export const outdoorWeather = {
  location: "Pune, IN",
  temperature: 33.1,
  humidity: 40,
  pressure: 1010,
  condition: "Partly Cloudy",
  windSpeed: 12,
  icon: "partly-cloudy",
  aqi: { index: 2, label: "Fair" },
};
