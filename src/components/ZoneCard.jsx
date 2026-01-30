import ResourceList from "./ResourceList";
import ZoneAllocationTable from "./ZoneAllocationTable";

const priorityStyles = {
  HIGH: "border-red-400 bg-red-50",
  MEDIUM: "border-yellow-400 bg-yellow-50",
  LOW: "border-green-400 bg-green-50",
};

export default function ZoneCard({ zone }) {
  return (
    <div
      className={`border rounded p-4 ${priorityStyles[zone.priority]}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">
          Zone {zone.zone_id}
        </h3>
        <span className="font-bold">{zone.priority}</span>
      </div>

      <div>
        <strong className="text-sm">Resources allocated:</strong>
        <ResourceList summary={zone.resource_summary} />
      </div>

      <ZoneAllocationTable
        assignedResources={zone.assigned_resources}
      />

      <div className="text-sm mb-2">
        Confidence:{" "}
        <strong>{Math.round(zone.confidence * 100)}%</strong>
      </div>

      {zone.unserved > 0 && (
        <div className="text-sm text-red-600 mb-2">
          ⚠️ Unserved demand: {zone.unserved}
        </div>
      )}

    </div>
  );
}
