import { useState } from "react";
import { runOptimization } from "./services/api";

import DisasterInputPanel from "./components/disasterInputPanel";
import AgentStatus from "./components/AgentStatus";
import ZoneResultsList from "./components/ZoneResultsList";
import HospitalResourcesPanel from "./components/HospitalResourcesPanel";
import SatellitePhotosPanel from "./components/SatellitePhotosPanel";
import FloodRiskPanel from "./components/FloodRiskPanel";

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

/** ✅ Top switcher: looks like title tabs */
function TopTitleTabs({ active, onChange }) {
  const tabClass = (key) =>
    `relative pb-5 text-lg font-bold transition cursor-pointer ${
      active === key
        ? "text-gray-900"
        : "text-gray-500 hover:text-gray-800"
    }`;

  const underlineClass = (key) =>
    `absolute left-0 -bottom-[1px] h-[3px] w-full rounded transition ${
      active === key ? "bg-blue-600" : "bg-transparent"
    }`;

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex items-end gap-10 border-b">
        <button
          className={tabClass("allocation")}
          onClick={() => onChange("allocation")}
        >
          Disaster Resource Allocation
          <span className={underlineClass("allocation")} />
        </button>

        <button
          className={tabClass("flood")}
          onClick={() => onChange("flood")}
        >
          Flood Risk Analysis
          <span className={underlineClass("flood")} />
        </button>

        <div className="flex-1" />
      </div>

      {/* Subline */}
      <div className="mt-3 text-sm text-gray-500">
        {active === "allocation"
          ? "Optimize resource allocation across zones and hospitals."
          : "Analyze province-level flood risk using forecast data."}
      </div>
    </div>
  );
}



export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Which top section is visible
  const [mode, setMode] = useState("allocation"); // "allocation" | "flood"

  // Allocation inner tabs
  const [topTab, setTopTab] = useState("assessment");
  const [activeTab, setActiveTab] = useState("zones");

  const [showPhotos, setShowPhotos] = useState(false);

  const topTabs = [
    { value: "assessment", label: "Agent Assessment" },
    // (optional) keep this if you want: { value: "other", label: "..." }
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
      setActiveTab("zones");
      setTopTab("assessment");
      setMode("allocation"); // after run, stay in allocation view
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-11/12 max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
        {/* ✅ TOP selectable titles */}
        {/* TOP HEADER TABS */}
<div className="mb-6">
  <TopTitleTabs active={mode} onChange={setMode} />


        </div>

        {/* =========================
            ✅ FLOOD MODE
           ========================= */}
        {mode === "flood" && (
          <div>
            <FloodRiskPanel />
          </div>
        )}

        {/* =========================
            ✅ ALLOCATION MODE
           ========================= */}
        {mode === "allocation" && (
          <>
            <DisasterInputPanel
              onRun={runAllocation}
              loading={loading}
              onShowPhotos={() => setShowPhotos(true)}
            />

            {showPhotos && (
              <SatellitePhotosPanel onClose={() => setShowPhotos(false)} />
            )}

            {loading && <p className="text-gray-600 mb-4">Analyzing situation…</p>}

            {error && <div className="mb-4 text-red-600">❌ {error}</div>}

            {data && (
              <>
                {/* TOP TABS inside allocation */}
                <Tabs tabs={topTabs} activeTab={topTab} onChange={setTopTab} />

                {topTab === "assessment" && (
                  <AgentStatus
                    reasoning={data.agent_reasoning}
                    events={data.events_applied}
                    fallback={data.fallback_used}
                  />
                )}

                {/* Bottom tabs */}
                <Tabs
                  tabs={bottomTabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                {activeTab === "zones" && <ZoneResultsList results={data.results} />}

                {activeTab === "hospitals" && (
                  <HospitalResourcesPanel results={data.results} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
