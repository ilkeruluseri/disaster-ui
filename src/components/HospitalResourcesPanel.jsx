

function buildHospitalDispatch(results) {
  const dispatch = {};

  results.forEach(zone => {
    zone.assigned_resources.forEach(ar => {
      const hospital = ar.hospital;
      const zoneId = zone.zone_id;

      if (!dispatch[hospital]) {
        dispatch[hospital] = {};
      }

      if (!dispatch[hospital][zoneId]) {
        dispatch[hospital][zoneId] = {};
      }

      for (const [rtype, count] of Object.entries(ar.resource_breakdown)) {
        dispatch[hospital][zoneId][rtype] =
          (dispatch[hospital][zoneId][rtype] || 0) + count;
      }
    });
  });

  return dispatch;
}

function HospitalResourcesPanel({ results }) {
  const dispatch = buildHospitalDispatch(results);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">
        Hospital Dispatch Plan
      </h2>

      {Object.entries(dispatch).map(([hospital, zones]) => (
        <div
          key={hospital}
          className="border rounded p-4 mb-4 bg-gray-50"
        >
          <h3 className="font-semibold mb-2">
            🏥 {hospital}
          </h3>

          {Object.entries(zones).map(([zoneId, resources]) => (
            <div
              key={zoneId}
              className="ml-4 mb-2 p-2 border-l-2 border-gray-300"
            >
              <div className="text-sm font-medium">
                → Zone {zoneId}
              </div>

              <ul className="ml-4 text-sm text-gray-700">
                {Object.entries(resources).map(([rtype, count]) => (
                  <li key={rtype}>
                    {rtype.replace("_", " ")}: {count}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HospitalResourcesPanel;