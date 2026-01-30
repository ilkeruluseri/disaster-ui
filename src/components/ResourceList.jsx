const icons = {
  ambulance: "🚑",
  helicopter: "🚁",
  marine_ambulance: "🚤",
  search_and_rescue: "🧭",
};

export default function ResourceList({ summary }) {
  if (!summary || Object.keys(summary).length === 0) {
    return <p className="text-sm text-gray-500">No resources assigned</p>;
  }

  return (
    <ul className="text-sm space-y-1">
      {Object.entries(summary).map(([type, count]) => (
        <li key={type}>
          {icons[type] || "🔧"} {type.replaceAll("_", " ")} × {count}
        </li>
      ))}
    </ul>
  );
}
