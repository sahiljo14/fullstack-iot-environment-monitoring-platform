<div align="center">

  <img src="https://img.shields.io/badge/EnviroSense-IoT%20Platform-22d3ee?style=for-the-badge&labelColor=0f172a" alt="EnviroSense" height="40"/>

  <br/>
  <br/>

  [![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1200&color=22D3EE&center=true&vCenter=true&width=600&lines=Real-Time+IoT+Environment+Monitoring;Multi-Parameter+Sensor+Dashboard;AI-Powered+Environmental+Assistant;Indoor+%2B+Outdoor+Data+Fusion)](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform)

  <br/>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
  [![Last Commit](https://img.shields.io/github/last-commit/sahiljo14/fullstack-iot-environment-monitoring-platform?style=flat-square&color=8b5cf6)](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform/commits/main)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform/pulls)
  [![Issues](https://img.shields.io/github/issues/sahiljo14/fullstack-iot-environment-monitoring-platform?style=flat-square&color=ef4444)](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform/issues)

  <br/>

  <a href="#-features">Features</a> &nbsp;·&nbsp;
  <a href="#%EF%B8%8F-architecture">Architecture</a> &nbsp;·&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;·&nbsp;
  <a href="#-setup--installation">Setup</a> &nbsp;·&nbsp;
  <a href="#-api-reference">API</a> &nbsp;·&nbsp;
  <a href="#-security-considerations">Security</a> &nbsp;·&nbsp;
  <a href="#-contributing">Contributing</a>

</div>

---

## Overview

**EnviroSense** is a production-ready, full-stack IoT platform that ingests multi-parameter environmental sensor data over MQTT, persists it to a cloud-hosted PostgreSQL database, and surfaces it through a live React dashboard — with real-time weather integration and an AI-powered environmental assistant.

The platform supports physical IoT devices and includes a software simulator that models realistic sensor drift, making it possible to run and demo the full system without any hardware.

---

## Features

<table>
<tr>
<td>

**Real-Time Data Pipeline**
- Live MQTT ingestion — readings streamed every 2 s
- Dashboard auto-polls every 3 s with zero page refresh
- Skeleton loading states while data initializes

</td>
<td>

**Multi-Parameter Sensing**
- Temperature, humidity, barometric pressure
- TVOC (total volatile organic compounds)
- eCO₂ (equivalent CO₂ concentration)

</td>
</tr>
<tr>
<td>

**Interactive Dashboard**
- Metric cards with trend indicators (up/down/stable)
- Inline sparklines per metric
- Time-series charts via Recharts
- Paginated historical data table with CSV export

</td>
<td>

**Weather & AQI Integration**
- Proxied OpenWeatherMap API (current conditions + AQI)
- Browser geolocation with fallback coordinates
- Server-side 5-minute cache — stays well within API limits
- Indoor vs. outdoor comparison panel

</td>
</tr>
<tr>
<td>

**EnviroAI Chatbot**
- Domain-restricted AI assistant (Sarvam AI)
- Answers queries about air quality, ventilation, sensor readings
- Prompt-injection defence + domain keyword gate
- Sliding-window rate limiter (50 req/min per IP)

</td>
<td>

**Production-Ready Backend**
- Retry-on-boot DB connection (5 attempts, 3 s back-off)
- `/health` endpoint for uptime monitoring
- CSV export (up to 1,000 rows)
- CORS-enabled REST API

</td>
</tr>
</table>

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Edge / Simulator Layer                                                  │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Sensor Device  ──or──  Node.js Simulator (Gaussian drift)     │   │
│   │  { temperature, humidity, pressure, tvoc, eco2 }               │   │
│   └────────────────────────────┬────────────────────────────────────┘   │
└───────────────────────────────┬┘                                         │
                                │ MQTT publish (JSON payload, every 2 s)  │
                                ▼                                          │
┌──────────────────────────────────────────────────────────────────────────┐
│  Transport Layer                                                         │
│  MQTT Broker  (HiveMQ public for dev — private broker for production)   │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ MQTT subscribe
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Backend  (Node.js + Express 5)                                          │
│                                                                          │
│  ┌──────────────────┐   ┌─────────────────────────────────────────────┐ │
│  │  MQTT Subscriber │   │  REST API                                   │ │
│  │  ─────────────── │   │  ───────────────────────────────────────── │ │
│  │  Parse payload   │   │  GET  /data          ← sensor readings      │ │
│  │  Validate fields │   │  GET  /data/export   ← CSV download         │ │
│  │  INSERT to DB    │   │  GET  /weather       ← OWM proxy + cache    │ │
│  └────────┬─────────┘   │  POST /chat          ← AI proxy + guards    │ │
│           │             │  GET  /health         ← liveness check       │ │
│           │             └────────────────────────┬────────────────────┘ │
└───────────┼────────────────────────────────────┬─┼──────────────────────┘
            │                                    │ │
            ▼                                    │ │                       
┌─────────────────────┐         OpenWeatherMap   │ │  REST JSON
│  PostgreSQL         │         API (weather +   │ │
│  (Supabase)         │         AQI)             │ │  Sarvam AI API
│  table: readings    │                          │ │  (sarvam-m model)
└─────────────────────┘                          │ │
                                                 ▼ ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Frontend  (React 18 + Vite + Tailwind CSS)                              │
│                                                                          │
│  Header (location · live indicator · last-updated timestamp)            │
│                                                                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────────────────┐ │
│  │Temperature│ │ Humidity  │ │ Pressure  │ │  Air Quality             │ │
│  │ MetricCard│ │ MetricCard│ │ MetricCard│ │  TVOC + eCO₂  MetricCard │ │
│  │ + Sparkline│ │+ Sparkline│ │+ Sparkline│ │  + Sparkline             │ │
│  └───────────┘ └───────────┘ └───────────┘ └──────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  ChartsPanel                │  │  ComparisonPanel                │   │
│  │  Time-series (Recharts)     │  │  Indoor vs. Outdoor             │   │
│  │  All metrics, tabbed        │  │  Weather + AQI                  │   │
│  └─────────────────────────────┘  └─────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  DataTable                  │  │  ChatbotPanel (EnviroAI)        │   │
│  │  Historical readings        │  │  AI-powered Q&A assistant       │   │
│  │  Paginated + CSV export     │  │  Context-aware responses        │   │
│  └─────────────────────────────┘  └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

<div align="center">

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![MQTT](https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white)](https://mqtt.org)

### Frontend
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://recharts.org)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com)

### External APIs & Services
[![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)](https://openweathermap.org/api)
[![HiveMQ](https://img.shields.io/badge/HiveMQ-yellow?style=for-the-badge&logo=mqtt&logoColor=black)](https://www.hivemq.com)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-8b5cf6?style=for-the-badge&logo=openai&logoColor=white)](https://sarvam.ai)

</div>

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **MQTT transport** | mqtt.js 5.x | Publish/subscribe sensor data between device and backend |
| **Backend framework** | Express 5.x | REST API routing, middleware, CORS |
| **Database driver** | node-postgres (pg) 8.x | Connection pooling, parameterized queries |
| **Database** | PostgreSQL on Supabase | Persistent storage with SSL-enforced cloud hosting |
| **UI framework** | React 18 | Component-driven dashboard with hooks-based state |
| **Build tool** | Vite 5 | Fast HMR dev server, optimized production bundle |
| **Styling** | Tailwind CSS 3 | Utility-first responsive layout |
| **Charts** | Recharts 2 | Declarative time-series visualizations |
| **Icons** | Lucide React | Consistent SVG icon set |
| **AI model** | Sarvam `sarvam-m` | Multilingual, domain-restricted environmental assistant |
| **Weather** | OpenWeatherMap v2.5 | Current conditions + Air Quality Index (1–5 scale) |

---

## Project Structure

```
fullstack-iot-environment-monitoring-platform/
│
├── backend/
│   ├── index.js              # Entry point: MQTT subscriber + Express API + AI proxy
│   ├── package.json
│   └── .env                  # ⚠ NOT committed — see Environment Variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── ChartsPanel.jsx       # Tabbed time-series charts for all metrics
│   │   │       ├── ChatbotPanel.jsx      # EnviroAI conversational interface
│   │   │       ├── ComparisonPanel.jsx   # Indoor/outdoor side-by-side with AQI
│   │   │       ├── DataTable.jsx         # Paginated table + CSV export button
│   │   │       ├── Header.jsx            # App bar: location, live dot, last-updated
│   │   │       ├── MetricCard.jsx        # Single-metric card with trend + sparkline
│   │   │       ├── SkeletonCard.jsx      # Animated placeholder during initial load
│   │   │       └── Sparkline.jsx         # Inline SVG mini trend chart
│   │   ├── pages/
│   │   │   └── Index.jsx                 # Main dashboard page — composes all panels
│   │   ├── hooks/                        # Custom React hooks (data fetching, polling)
│   │   ├── lib/
│   │   │   ├── api.js                    # fetchReadings / fetchWeather wrappers
│   │   │   └── mockData.js               # Fallback data used before live data arrives
│   │   ├── App.jsx
│   │   ├── index.css                     # Global styles + CSS custom properties
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── simulator/
    ├── sensor.js             # Simulated IoT device — Gaussian drift model, 2 s publish interval
    └── package.json
```

---

## API Reference

All endpoints are served by the backend. Default base URL: `http://localhost:3000`

### `GET /data`

Returns sensor readings ordered by timestamp descending.

| Parameter | Type | Default | Max | Description |
| :--- | :--- | :--- | :--- | :--- |
| `limit` | integer | `120` | `500` | Number of records to return |

<details>
<summary>Response example</summary>

```json
[
  {
    "id": 42,
    "timestamp": "2026-04-24T10:30:00.000Z",
    "temperature": 27.5,
    "humidity": 55.2,
    "pressure": 1013.1,
    "tvoc": 120,
    "eco2": 650
  }
]
```

</details>

---

### `GET /data/export`

Downloads up to 1,000 most recent readings as a UTF-8 CSV file.

- **Content-Type:** `text/csv`
- **Content-Disposition:** `attachment; filename=envirosense-<timestamp>.csv`

<details>
<summary>CSV format</summary>

```
Timestamp,Temperature(°C),Humidity(%),Pressure(hPa),TVOC(ppb),eCO2(ppm)
2026-04-24T10:30:00.000Z,27.5,55.2,1013.1,120,650
```

</details>

---

### `GET /weather`

Proxies current weather conditions and AQI for a coordinate pair via OpenWeatherMap. Results are cached server-side for 5 minutes per unique coordinate (rounded to 2 decimal places).

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `lat` | float | Yes | Latitude |
| `lon` | float | Yes | Longitude |

<details>
<summary>Response example</summary>

```json
{
  "location": "Mumbai, IN",
  "temperature": 31.2,
  "humidity": 72,
  "pressure": 1008,
  "condition": "Partly cloudy",
  "windSpeed": 14.4,
  "icon": "02d",
  "aqi": {
    "index": 2,
    "label": "Fair"
  }
}
```

AQI index follows the OpenWeatherMap scale: `1` Good · `2` Fair · `3` Moderate · `4` Poor · `5` Very Poor

</details>

---

### `POST /chat`

Submits a message to the EnviroAI assistant with optional live sensor context. Applies domain filtering, prompt-injection detection, and rate limiting before forwarding to Sarvam AI.

**Rate limit:** 50 requests/minute per IP — exceeding returns HTTP `429` with `retryAfterSeconds`.

<details>
<summary>Request / response example</summary>

**Request body**

```json
{
  "message": "Is the indoor CO₂ level safe right now?",
  "context": {
    "indoor": {
      "temperature": 27.5,
      "humidity": 55,
      "pressure": 1013,
      "tvoc": 120,
      "eco2": 650
    },
    "outdoor": {
      "temperature": 31.2,
      "humidity": 72,
      "condition": "Partly cloudy",
      "windSpeed": 14.4,
      "aqi": { "index": 2, "label": "Fair" }
    }
  }
}
```

**Response**

```json
{
  "reply": "Your indoor eCO₂ at 650 ppm is within the safe range (below 1000 ppm). With outdoor AQI at Fair, opening windows for ventilation is a reasonable option."
}
```

</details>

---

### `GET /health`

Liveness check reporting database connectivity and MQTT broker state.

```json
{
  "status": "ok",
  "db": "connected",
  "mqtt": true
}
```

---

## Database Schema

Run the following SQL once in your Supabase (or any PostgreSQL) instance before starting the backend.

```sql
CREATE TABLE readings (
  id          SERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC,
  humidity    NUMERIC,
  pressure    NUMERIC,
  tvoc        NUMERIC,
  eco2        NUMERIC
);

-- Optional: index to speed up time-ordered queries
CREATE INDEX idx_readings_timestamp ON readings (timestamp DESC);
```

---

## Setup & Installation

### Prerequisites

| Requirement | Version | Notes |
| :--- | :--- | :--- |
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Bundled with Node.js |
| PostgreSQL | Any | [Supabase free tier](https://supabase.com) works out of the box |
| OpenWeatherMap key | — | [Free tier](https://openweathermap.org/api) includes weather + AQI |
| Sarvam AI key | — | [Optional](https://sarvam.ai) — chatbot is disabled without it |
| MQTT broker | — | Public HiveMQ broker used by default (see [Security Considerations](#-security-considerations)) |

---

### 1 — Clone

```bash
git clone https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform.git
cd fullstack-iot-environment-monitoring-platform
```

---

### 2 — Database

1. Create a new project at [supabase.com](https://supabase.com) (or use an existing PostgreSQL server).
2. Run the schema from the [Database Schema](#database-schema) section in the SQL editor.
3. Copy the connection string from **Project Settings → Database → URI**.

---

### 3 — Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Required
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
OPENWEATHER_API_KEY=your_openweathermap_api_key

# Optional
SARVAM_API_KEY=your_sarvam_api_key   # omit to disable /chat
PORT=3000                             # default: 3000
NODE_ENV=development                  # set to "production" for cleaner API output
```

> **Important:** Never commit `.env` to version control. Verify `backend/.env` is covered by `.gitignore`.

Start the backend:

```bash
node index.js
```

You should see:

```
✅ Database connected successfully
✅ MQTT connected
🚀 Server running on port 3000
📊 Data endpoint: http://localhost:3000/data
❤️  Health check: http://localhost:3000/health
```

---

### 4 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard is available at **http://localhost:3001**.

To build for production:

```bash
npm run build        # outputs to frontend/dist/
npm run preview      # locally preview the production build
```

---

### 5 — Simulator

In a separate terminal, start the simulated sensor device. It publishes realistic drifting readings every 2 seconds.

```bash
cd simulator
npm install
node sensor.js
```

The simulator uses a **Gaussian drift model** — each new value is bounded within physical constraints and shifts by a random delta from the previous value, producing smooth, realistic time-series data:

| Metric | Range | Max step per tick |
| :--- | :--- | :--- |
| Temperature | 20 – 40 °C | ±0.3 °C |
| Humidity | 30 – 80 % | ±0.5 % |
| Pressure | 1000 – 1025 hPa | ±0.3 hPa |
| TVOC | 20 – 500 ppb | ±8 ppb |
| eCO₂ | 400 – 1500 ppm | ±15 ppm |

---

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | — | Full PostgreSQL connection URI (SSL required for Supabase) |
| `OPENWEATHER_API_KEY` | Yes | — | OpenWeatherMap key — used for weather + AQI at `/weather` |
| `SARVAM_API_KEY` | No | — | Sarvam AI key — omit to disable `/chat` endpoint |
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | Set to `production` to strip `_debug` metadata from `/weather` responses |

---

## Security Considerations

### MQTT broker

The default configuration connects to the **HiveMQ public test broker**. This broker is:

- **Unauthenticated** — no credentials required
- **Shared** — any party can subscribe to any topic
- **Not suitable for production** — no persistence or TLS guarantees

This means anyone who discovers the MQTT topic in use can subscribe to the live sensor stream or publish arbitrary payloads that the backend will attempt to process.

**For production**, replace the public broker with a private, authenticated instance:

```bash
# MQTT with username/password
mqtt://username:password@your-broker.example.com:1883

# MQTT over TLS (recommended)
mqtts://your-broker.example.com:8883
```

Update the broker URL in both `backend/index.js` and `simulator/sensor.js`, and choose a unique, non-guessable topic name.

### EnviroAI chatbot defence layers

The `/chat` endpoint applies three layers of protection before forwarding any message to the AI model:

1. **Prompt-injection detection** — 16 regex patterns screen for jailbreak attempts, role-override instructions, and system-prompt extraction requests. This check runs *before* the domain gate so spoofed environment keywords cannot bypass it.
2. **Domain keyword gate** — messages must contain at least one of 50+ recognized environment-related keywords (temperature, AQI, ventilation, eCO₂, etc.) or they are rejected without an upstream API call.
3. **Rate limiting** — a sliding-window in-memory limiter enforces a maximum of 50 requests per minute per IP address. Exceeding it returns HTTP `429` with a `retryAfterSeconds` field.

### CORS

CORS is currently open (`origin: *`) for development convenience. Lock it down before deploying:

```js
// backend/index.js
app.use(cors({ origin: 'https://your-dashboard.example.com' }));
```

### API keys

All sensitive values — `DATABASE_URL`, `OPENWEATHER_API_KEY`, `SARVAM_API_KEY` — are read exclusively from environment variables at runtime. None are logged, echoed in API responses, or embedded in source code.

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code is consistent with the existing style and that the backend starts cleanly (`node index.js`) before submitting.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with care by

**[Sahil Joshi](https://github.com/sahiljo14)** &nbsp;·&nbsp; **[Omkar Sonawane](https://github.com/omkar-53)**

[![GitHub](https://img.shields.io/badge/GitHub-sahiljo14-181717?style=flat-square&logo=github)](https://github.com/sahiljo14)
[![GitHub](https://img.shields.io/badge/GitHub-omkar--53-181717?style=flat-square&logo=github)](https://github.com/omkar-53)

<br/>

⭐ If this project helped you, consider giving it a star on [GitHub](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform)

</div>