import { useState } from "react";
import { runOptimization } from "./services/api";

import DisasterInputPanel from "./components/disasterInputPanel";
import AgentStatus from "./components/AgentStatus";
import ZoneResultsList from "./components/ZoneResultsList";
import HospitalResourcesPanel from "./components/HospitalResourcesPanel";
import SatellitePhotosPanel from "./components/SatellitePhotosPanel";

function Tabs({ tabs, activeTab, onChange }) {
  const tabClass = (tab) =>
    `px-4 py-2 rounded-t font-medium ${
      activeTab === tab
        ? "bg-white border-b-2 border-blue-600"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={tabClass(tab.value)}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [topTab, setTopTab] = useState("assessment");
  const [activeTab, setActiveTab] = useState("zones");
  const [showPhotos, setShowPhotos] = useState(false);

  const topTabs = [
    { value: "assessment", label: "Agent Assessment" },
    { value: "graph", label: "Graph" },
  ];

  const bottomTabs = [
    { value: "zones", label: "Zones" },
    { value: "hospitals", label: "Hospitals" },
  ];

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
            lat: 38.5,
            lon: 27.25,
            terrain_type: "mountain",
          },
        ],
        events: [],
        useAgent: true,
      });

      setData(result);
      setActiveTab("zones"); // reset to default view
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-11/12 max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Disaster Resource Allocation
        </h1>

        <DisasterInputPanel
          onRun={runAllocation}
          loading={loading}
          onShowPhotos={() => setShowPhotos(true)}
        />

        {showPhotos && (
          <SatellitePhotosPanel onClose={() => setShowPhotos(false)} />
        )}

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
            {/* TOP TABS */}
            <Tabs
              tabs={topTabs}
              activeTab={topTab}
              onChange={setTopTab}
            />

            {/* AGENT ASSESSMENT VIEW */}
            {topTab === "assessment" && (
                <AgentStatus
                  reasoning={data.agent_reasoning}
                  events={data.events_applied}
                  fallback={data.fallback_used}
                />
            )}

            {/* GRAPH VIEW */}
            {topTab === "graph" && (
              <div className="h-[500px] border rounded bg-gray-50 flex items-center justify-center text-gray-500">
                Graph will go here
              </div>
            )}

            {/* BOTTOM TABS */}
              <Tabs
                tabs={bottomTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              {activeTab === "zones" && (
                <ZoneResultsList results={data.results} />
              )}

              {activeTab === "hospitals" && (
                <HospitalResourcesPanel results={data.results} />
              )}
          </>
        )}

      </div>
    </div>
  );
}
