function buildHospitalDispatch(results) {
  const dispatch = {};

  results.forEach(zone => {
    zone.assigned_resources.forEach(ar => {
      const hospital = ar.hospital;
      const zoneId = zone.zone_id;

      if (!dispatch[hospital]) dispatch[hospital] = {};
      if (!dispatch[hospital][zoneId]) dispatch[hospital][zoneId] = {};

      for (const [rtype, count] of Object.entries(ar.resource_breakdown)) {
        dispatch[hospital][zoneId][rtype] =
          (dispatch[hospital][zoneId][rtype] || 0) + count;
      }
    });
  });

  return dispatch;
}

export default function HospitalResourcesPanel({ results }) {
  const dispatch = buildHospitalDispatch(results);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Resource Dispatch Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(dispatch).map(([hospital, zones]) => (
          <div
            key={hospital}
            className="rounded-lg border p-4 bg-gray-50 shadow-sm"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              🏥 {hospital}
            </h3>

            <div className="space-y-2">
              {Object.entries(zones).map(([zoneId, resources]) => (
                <div
                  key={zoneId}
                  className="p-2 bg-white border rounded"
                >
                  <div className="text-sm font-medium mb-1">
                    → Zone {zoneId}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    {Object.entries(resources).map(([rtype, count]) => (
                      <span
                        key={rtype}
                        className="px-2 py-1 bg-gray-100 rounded"
                      >
                        {rtype.replace("_", " ")}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
