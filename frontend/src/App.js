import React, { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getLocationAndWeather = () => {
    setError(null);
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("fetching");
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch("/api/weather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lon, username }),
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Server error");
          }
          const data = await res.json();
          setResult(data);
          setStatus("done");
        } catch (err) {
          setError(err.message || "Failed to fetch weather");
          setStatus("idle");
        }
      },
      () => {
        setError("Permission denied or position unavailable.");
        setStatus("idle");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Hello — Weather App</h1>

        <label className="label">Enter your name</label>
        <input
          className="input"
          placeholder="e.g. Akshay"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="actions">
          <button
            className="btn"
            onClick={getLocationAndWeather}
            disabled={status === "locating" || status === "fetching"}
          >
            {status === "locating" ? "Locating…" : status === "fetching" ? "Fetching…" : "Get my city & temperature"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h2>Hello {result.username || "Friend"} 👋</h2>
            <p><strong>City:</strong> {result.city}</p>
            <p><strong>Temperature:</strong> {result.temperature_c} °C</p>
          </div>
        )}
      </div>
    </div>
  );
}
