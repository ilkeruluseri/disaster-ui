import ZoneCard from "./ZoneCard";

export default function ZoneResultsList({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-4">
      {results.map((zone) => (
        <ZoneCard key={zone.zone_id} zone={zone} />
      ))}
    </div>
  );
}
