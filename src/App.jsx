import { useState, useRef } from "react";
import { runOptimization, runNextRound } from "./services/api";

import DisasterInputPanel from "./components/disasterInputPanel";
import AgentStatus from "./components/AgentStatus";
import ZoneResultsList from "./components/ZoneResultsList";
import HospitalResourcesPanel from "./components/HospitalResourcesPanel";
import SatellitePhotosPanel from "./components/SatellitePhotosPanel";
import EventBuilder from "./components/EventBuilder";


/**
 * @typedef {Object} Round
 * @property {number} roundNumber
 * @property {Array} dispatches
 * @property {number} remainingDemand
 * @property {string} reasoning
 */


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
  const [currentStep, setCurrentStep] = useState(0);
  const [simulation, setSimulation] = useState({ rounds: [] });
  const allocRanRef = useRef(false);



  const topTabs = [
    { value: "assessment", label: "Agent Assessment" },
    // (optional) keep this if you want: { value: "other", label: "..." }
  ];

  const bottomTabs = [
    { value: "zones", label: "Zones" },
    { value: "hospitals", label: "Resources" },
  ];

  const runAllocation = async () => {
    if (allocRanRef.current) return;
    allocRanRef.current = true;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const optimizationInput = {
        disasterType: "earthquake",
        coordinates: undefined, // or null, if your backend allows it
        useAgent: true,
        zones: [
          {
            zone_id: "Z1",
            damage_severity: 0.9,
            population_density: 0.04,
            demand: 80,
            lat: 39.87,
            lon: 30.16,
          },
          {
            zone_id: "Z2",
            damage_severity: 0.8,
            population_density: 0.9,
            demand: 200,
            lat: 40.0,
            lon: 30.0,
          },
        ],
        events: [
          {
            event_type: "road_collapse",
            params: {
              hospital_id: "H1",
              zone_id: "Z2",
            },
          },
        ],
      };
      const result = await runOptimization(optimizationInput);

      const round1 = {
        roundNumber: result.round_number,
        dispatches: result.dispatches,
        remainingDemand: result.remaining_demand,
        reasoning: result.round_reasoning,
        roundAllocation: result.initial_allocation, // ONLY round 1 has this
      };

      setSimulation({ rounds: [round1] });
      setCurrentStep(1);
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

  const handleNextRound = async (events = []) => {
    console.log("Running next round with events:", events);
    setLoading(true);
    setError(null);

    try {
      const result = await runNextRound(events);
      const round = {
        roundNumber: result.round_number,
        dispatches: result.dispatches,
        remainingDemand: result.remaining_demand,
        reasoning: result.round_reasoning,
        roundAllocation: result.round_allocation,
      };
      setSimulation(s => ({ rounds: [...s.rounds, round] }));
      setCurrentStep(s => s + 1);
      setData(result);
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
        <DisasterInputPanel
          loading={loading}
          onShowPhotos={() => setShowPhotos(true)}
        />

        {showPhotos && (
          <SatellitePhotosPanel onClose={() => setShowPhotos(false)} onComplete={runAllocation}/>
        )}

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

            {/* GRAPH VIEW */}
            {topTab === "graph" && (
              <div className="h-[500px] border rounded bg-gray-50 flex items-center justify-center text-gray-500">
                Graph will go here
              </div>
            )}

            <p className="text-sm text-gray-500">
              Step {currentStep}
            </p>

            <div className="flex gap-2 mt-4">

              <EventBuilder onSubmit={handleNextRound} />

            </div>

            {/* BOTTOM TABS */}
              <Tabs
                tabs={bottomTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              {activeTab === "zones" && !loading && (
                <ZoneResultsList results={simulation.rounds[currentStep - 1].roundAllocation} />
              )}

              {activeTab === "hospitals" && !loading && (
                <HospitalResourcesPanel results={simulation.rounds[currentStep - 1].roundAllocation} />
              )}

              {loading && <LoadingOverlay />}
              
          </>
        )}
      </div>
    </div>
  );

}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Large Spinner */}
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        {/* Inner Pulse for extra "pizzazz" */}
        <div className="absolute inset-4 bg-blue-600 rounded-full animate-pulse opacity-20"></div>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-800 animate-pulse">
        Optimizing Next Round...
      </h2>
      <p className="text-gray-500 mt-2">Recalculating resource distribution</p>
    </div>
  );
}