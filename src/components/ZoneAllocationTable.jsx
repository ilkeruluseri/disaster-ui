function ZoneAllocationTable({ assignedResources }) {
  return (
    <table className="w-full text-sm mt-3 border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Hospital</th>
          <th className="p-2 text-left">Resource</th>
          <th className="p-2 text-right">Units</th>
        </tr>
      </thead>
      <tbody>
        {assignedResources.map((entry, idx) =>
          Object.entries(entry.resource_breakdown).map(
            ([resourceType, count]) => (
              <tr key={`${idx}-${resourceType}`} className="border-t">
                <td className="p-2">{entry.hospital}</td>
                <td className="p-2">{resourceType.replace("_", " ")}</td>
                <td className="p-2 text-right">{count}</td>
              </tr>
            )
          )
        )}
      </tbody>
    </table>
  );
}
export default ZoneAllocationTable;