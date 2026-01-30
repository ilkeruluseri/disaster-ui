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
