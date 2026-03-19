require('dotenv').config();

const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ PostgreSQL (Supabase) - with pooler support + timeout
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// ✅ Test DB connection on startup
async function testDBConnection() {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log("✅ Database connected successfully");
      client.release();
      return true;
    } catch (err) {
      retries--;
      console.error(`❌ DB connection failed (${5 - retries}/5):`, err.message);
      if (retries === 0) {
        console.error("💀 Could not connect to database. Check your DATABASE_URL in .env");
        console.error("👉 Go to: Supabase Dashboard → Settings → Database → Connection string");
        return false;
      }
      console.log(`🔄 Retrying in 3 seconds...`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
}

// ✅ MQTT
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log("✅ MQTT connected");
  client.subscribe('iot/sahil/env', (err) => {
    if (err) {
      console.error("❌ MQTT subscription failed:", err.message);
    } else {
      console.log("📡 Subscribed to topic: iot/sahil/env");
    }
  });
});

client.on('error', (err) => {
  console.error("❌ MQTT error:", err.message);
});

client.on('message', async (topic, message) => {
  let data;

  // ✅ Prevent crash from bad JSON
  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    console.log("⚠️ Ignored invalid JSON:", message.toString());
    return;
  }

  // ✅ Validate required fields
  if (data.temperature === undefined || data.humidity === undefined) {
    console.log("⚠️ Ignored incomplete data:", data);
    return;
  }

  try {
    await pool.query(
      'INSERT INTO readings (temperature, humidity) VALUES ($1, $2)',
      [data.temperature, data.humidity]
    );
    console.log("💾 Saved:", data);
  } catch (err) {
    console.error("❌ DB insert error:", err.message);
  }
});

// ✅ API route - get latest 50 readings
app.get('/data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM readings ORDER BY timestamp DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err.message);
    res.status(500).json({ error: "Error fetching data", details: err.message });
  }
});

// ✅ Health check route
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', mqtt: client.connected });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ✅ Start server after DB check
testDBConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Data endpoint: http://localhost:${PORT}/data`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
});
