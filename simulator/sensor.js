const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log("✅ Simulator connected to MQTT broker");

  setInterval(() => {
    const data = {
      temperature: parseFloat((Math.random() * 10 + 25).toFixed(2)),
      humidity: parseFloat((Math.random() * 20 + 40).toFixed(2))
    };

    client.publish('iot/sahil/env', JSON.stringify(data), (err) => {
      if (err) {
        console.error("❌ Publish failed:", err.message);
      } else {
        console.log("📤 Sent:", data);
      }
    });

  }, 2000);
});

client.on('error', (err) => {
  console.error("❌ MQTT error:", err.message);
});

client.on('offline', () => {
  console.log("⚠️ MQTT client went offline. Reconnecting...");
});

client.on('reconnect', () => {
  console.log("🔄 Reconnecting to MQTT broker...");
});
