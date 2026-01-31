// src/services/api.js

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Run disaster optimization.
 *
 * @param {Object} payload
 * @param {"earthquake"|"flood"} payload.disasterType
 * @param {[number, number]} payload.coordinates [lat, lon]
 * @param {Array} payload.zones
 * @param {Array} payload.events
 * @param {boolean} payload.useAgent
 */
export async function runOptimization({
  disasterType,
  coordinates,
  zones = [],
  events = [],
  useAgent = true,
}) {
  const body = {
    disaster_type: disasterType,
    coordinates,
    zones,
    events,
    use_agent: useAgent,
  };

  const response = await fetch(`${API_BASE_URL}/optimize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Optimization failed (${response.status}): ${errorText}`
    );
  }

  return response.json();
}

export async function runNextRound(events = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/crisis/next-round`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Next round request failed");
    }

    const data = await response.json();
    return data; 

  } catch (err) {
    console.error("runNextRound error:", err);
    throw err;
  }
}

export async function predictImage({ file, disasterType, save = true }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("disaster_type", disasterType);
  formData.append("save", String(save));

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Prediction failed");
  }

  return res.json();
}
export async function getFloodRisk() {
  const res = await fetch(`${API_BASE_URL}/flood/risk`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flood risk fetch failed (${res.status}): ${text}`);
  }

  return res.json();
}