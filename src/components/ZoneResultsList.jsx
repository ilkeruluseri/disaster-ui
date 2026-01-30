import ZoneCard from "./ZoneCard";

const priorityOrder = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export default function ZoneResultsList({ results }) {
  if (!results || results.length === 0) return null;

  const sorted = [...results].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sorted.map((zone) => (
        <ZoneCard key={zone.zone_id} zone={zone} />
      ))}
    </div>
  );
}
