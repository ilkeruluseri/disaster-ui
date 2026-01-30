import { useState } from "react";
import { runOptimization } from "./services/api";

import DisasterInputPanel from "./components/disasterInputPanel";
import AgentStatus from "./components/AgentStatus";
import ZoneResultsList from "./components/ZoneResultsList";
import HospitalResourcesPanel from "./components/HospitalResourcesPanel";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const runAllocation = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await runOptimization({
        disasterType: "earthquake",
        coordinates: [38.42, 27.13],

        zones: [
          {
            zone_id: "Z1",
            damage_severity: 0.95,
            population_density: 0.85,
            medical_demand: 25,
            lat: 38.42,
            lon: 27.13,
            terrain_type: "coastal",
          },
          {
            zone_id: "Z2",
            damage_severity: 0.7,
            population_density: 0.9,
            medical_demand: 18,
            lat: 38.44,
            lon: 27.18,
            terrain_type: "urban",
          },
          {
            zone_id: "Z3",
            damage_severity: 0.8,
            population_density: 0.4,
            medical_demand: 12,
            lat: 38.50,
            lon: 27.25,
            terrain_type: "mountain",
          },
        ],

        events: [],

        useAgent: true,
      });

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Disaster Resource Allocation
        </h1>

        <DisasterInputPanel onRun={runAllocation} loading={loading} />

        {loading && (
          <p className="text-gray-600 mb-4">
            Analyzing situation…
          </p>
        )}

        {error && (
          <div className="mb-4 text-red-600">
            ❌ {error}
          </div>
        )}

        {data && (
          <>
            <AgentStatus
              reasoning={data.agent_reasoning}
              events={data.events_applied}
              fallback={data.fallback_used}
            />
            <ZoneResultsList results={data.results} />
            <HospitalResourcesPanel results={data.results} />
          </>
        )}
      </div>
    </div>
  );
}
