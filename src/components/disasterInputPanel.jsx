import { useState } from "react";
import MapPicker from "./MapPicker";

export default function DisasterInputPanel({
  onRun,
  loading,
  onShowPhotos,
}) {
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(10);
  const [disasterType, setDisasterType] = useState("earthquake");

  const handleRun = () => {
    onRun({
      coordinates: location,
      radius,
      disasterType,
    });
    onShowPhotos();
  };

  return (
    <div className="mb-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Disaster Type
        </label>
        <select
          value={disasterType}
          onChange={(e) => setDisasterType(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="earthquake">Earthquake</option>
          <option value="flood">Flood</option>
          <option value="wildfire">Wildfire</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Affected Radius (km)
        </label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Location
        </label>
        <MapPicker value={location} onChange={setLocation} />
        {location && (
          <div className="text-xs text-gray-600 mt-1">
            Selected: {location[0].toFixed(4)}, {location[1].toFixed(4)}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={loading || !location}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Run Allocation"}
        </button>

        <button
          onClick={onShowPhotos}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Photos
        </button>
      </div>
    </div>
  );
}
