import ZoneAllocationTable from "./ZoneAllocationTable";

function priorityColor(priority) {
  switch (priority) {
    case "HIGH":
      return "border-red-500 bg-red-50";
    case "MEDIUM":
      return "border-yellow-500 bg-yellow-50";
    case "LOW":
      return "border-green-500 bg-green-50";
    default:
      return "border-gray-300 bg-white";
  }
}

export default function ZoneCard({ zone }) {
  return (
    <div
      className={`rounded-lg border-l-4 p-4 shadow-sm ${priorityColor(
        zone.priority
      )}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">
            Zone {zone.zone_id}
          </h3>
          <p className="text-sm text-gray-600">
            Priority: <strong>{zone.priority}</strong>
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Planned Coverage</div>
          <div className="text-lg font-semibold">
            {(zone.planned_coverage * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Unserved:</span>{" "}
          <strong>{zone.allocation_gap}</strong>
        </div>
        <div>
          <span className="text-gray-500">Resources:</span>{" "}
          {Object.entries(zone.resource_summary).map(
            ([type, count]) => (
              <span key={type} className="mr-2">
                {type.replace("_", " ")} ({count})
              </span>
            )
          )}
        </div>
      </div>

      {/* Allocation Table */}
      <ZoneAllocationTable assignedResources={zone.assigned_resources} />
    </div>
  );
}
