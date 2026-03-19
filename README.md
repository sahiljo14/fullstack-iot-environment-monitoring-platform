# 🚀 Fullstack IoT Environment Monitoring Platform

## 📌 Overview
A real-time full-stack IoT platform that collects environmental data (temperature, humidity) from edge devices, streams it via MQTT, stores it in a cloud database, and visualizes it through a live dashboard.

## 🧠 Features
*   📡 **Real-time data streaming** using MQTT
*   🗄️ **Cloud database integration** (PostgreSQL - Supabase)
*   🔵 **Backend API** (Node.js + Express)
*   📊 **Live data visualization** (frontend - upcoming)
*   ⚡ **Scalable architecture** (device → cloud → dashboard)

## 🏗️ Architecture
`Sensor / Simulator` → `MQTT Broker` → `Backend` → `Database` → `Frontend`

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Communication** | MQTT (HiveMQ) |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL (Supabase) |
| **Simulator** | Node.js |
| **Frontend** | React (planned) |

## 📂 Project Structure
```text
fullstack-iot-environment-monitoring-platform/
├── backend/        # Node.js backend + MQTT subscriber
├── simulator/      # Fake sensor data generator
└── frontend/       # Dashboard (to be added)
```

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone [https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform.git](https://github.com/sahiljo14/fullstack-iot-environment-monitoring-platform.git)
cd fullstack-iot-environment-monitoring-platform
```

### 2️⃣ Backend setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add your database URL:

```env
DATABASE_URL=your_supabase_connection_string
```

Run the backend server:

```bash
node index.js
```

### 3️⃣ Simulator setup

Open a new terminal, navigate to the simulator directory, and start generating fake data:

```bash
cd simulator
npm install
node sensor.js
```

### 4️⃣ Test the API

Open your browser or Postman and go to:
http://localhost:3000/data

---

## 📡 MQTT Topic

Data is streamed over the following topic:
`iot/sahil/env`

## 📊 Sample Data

```json
{
  "temperature": 27.5,
  "humidity": 55.2
}
```

## 🚀 Future Improvements

*   📊 **React dashboard** (charts & analytics)
*   🚨 **Alert system** (threshold-based notifications)
*   📱 **Mobile app integration**
*   🌍 **Multi-device support**
*   🤖 **ML-based predictions**

## 💼 Resume Highlight

> Built a real-time full-stack IoT environment monitoring system using MQTT, Node.js, PostgreSQL, and cloud deployment with live data streaming and analytics.

## 📄 License

This project is licensed under the **MIT License**.

## 👨‍💻 Authors

* **[Sahil Joshi](https://github.com/sahiljo14)**
* **[Omkar Sonawane](https://github.com/omkar-53)**
