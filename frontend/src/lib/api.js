const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const fetchReadings = (limit = 120) => fetch(`${API_URL}/data?limit=${limit}`).then(r => r.json());
export const fetchWeather = (lat, lon) => fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}`).then(r => r.json());
export const sendChatMessage = (message, context) => fetch(`${API_URL}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, context }) }).then(r => r.json());
export const getExportURL = () => `${API_URL}/data/export`;
