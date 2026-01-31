import { useState } from "react";

const EVENT_TEMPLATES = {
  road_collapse: {
    description: "A road between a resource and zone has collapsed",
    params: ["hospital_id", "zone_id"],
  },
  bridge_out: {
    description: "A bridge between a resource and zone is out",
    params: ["hospital_id", "zone_id"],
  },
  weather: {
    description: "Severe weather conditions affecting all routes",
    params: ["penalty"],
  },
  flood: {
    description: "Flooding affecting route accessibility",
    params: ["severity_factor"],
  },
};

export default function EventBuilder({ onSubmit }) {
  const [eventType, setEventType] = useState("road_collapse");
  const [params, setParams] = useState({});
  const [events, setEvents] = useState([]);

  const template = EVENT_TEMPLATES[eventType];

  const addEvent = () => {
    setEvents(e => [
      ...e,
      {
        event_type: eventType,
        params: { ...params },
      },
    ]);
    setParams({});
  };

  return (
    <div className="border rounded p-4 mt-4 bg-gray-50">
      <h3 className="font-semibold mb-2">Next Round Events</h3>

      {/* Event type selector */}
      <select
        className="border p-2 rounded mb-2 w-full"
        value={eventType}
        onChange={e => {
          setEventType(e.target.value);
          setParams({});
        }}
      >
        {Object.keys(EVENT_TEMPLATES).map(t => (
          <option key={t} value={t}>
            {t.replace("_", " ")}
          </option>
        ))}
      </select>

      <p className="text-sm text-gray-600 mb-2">
        {template.description}
      </p>

      {/* Params */}
      <div className="flex flex-col gap-2">
        {template.params.map(p => (
          <input
            key={p}
            className="border p-2 rounded"
            placeholder={p}
            value={params[p] ?? ""}
            onChange={e =>
              setParams(prev => ({
                ...prev,
                [p]: e.target.value,
              }))
            }
          />
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={addEvent}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Add Event
        </button>

        <button
          onClick={() => onSubmit(events)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Run Next Round ▶
        </button>
      </div>

      {/* Preview */}
      {events.length > 0 && (
        <pre className="mt-3 text-xs bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(events, null, 2)}
        </pre>
      )}
    </div>
  );
}
