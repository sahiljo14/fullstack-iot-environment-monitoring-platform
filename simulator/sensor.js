const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

let state = {
  temperature: 27.5,
  humidity: 55,
  pressure: 1013,
  tvoc: 120,
  eco2: 650,
};

function drift(current, min, max, maxDelta) {
  const delta = (Math.random() - 0.5) * 2 * maxDelta;
  return Math.min(max, Math.max(min, +(current + delta).toFixed(2)));
}

client.on('connect', () => {
  console.log("✅ Simulator connected to MQTT broker");
  setInterval(() => {
    state.temperature = drift(state.temperature, 20, 40, 0.3);
    state.humidity = drift(state.humidity, 30, 80, 0.5);
    state.pressure = drift(state.pressure, 1000, 1025, 0.3);
    state.tvoc = Math.round(drift(state.tvoc, 20, 500, 8));
    state.eco2 = Math.round(drift(state.eco2, 400, 1500, 15));
    const data = { ...state };
    client.publish('iot/sahil/env', JSON.stringify(data), (err) => {
      if (err) console.error("❌ Publish failed:", err.message);
      else console.log("📤 Sent:", data);
    });
  }, 2000);
});

client.on('error', (err) => console.error("❌ MQTT error:", err.message));
client.on('offline', () => console.log("⚠️ MQTT offline. Reconnecting..."));
client.on('reconnect', () => console.log("🔄 Reconnecting..."));
