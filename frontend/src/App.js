import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

import './App.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [data, setData] = useState([]);

  // ✅ FIXED (no trailing slash)
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/data`);
        setData(res.data.reverse());
      } catch (err) {
        console.error("API ERROR:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1] || {};

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        label: 'Temperature',
        data: data.map(d => d.temperature),
        borderColor: '#ff4d4f',
        tension: 0.4
      },
      {
        label: 'Humidity',
        data: data.map(d => d.humidity),
        borderColor: '#1890ff',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="container">

      <h1 className="title">🌍 IoT Dashboard</h1>

      <div className="cards">
        <div className="card">
          <h3>🌡 Temperature</h3>
          <p>{latest.temperature || "--"} °C</p>
        </div>

        <div className="card">
          <h3>💧 Humidity</h3>
          <p>{latest.humidity || "--"} %</p>
        </div>
      </div>

      <div className="chart">
        <Line data={chartData} />
      </div>

    </div>
  );
}

export default App;