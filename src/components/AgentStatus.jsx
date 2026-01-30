export default function AgentStatus({ reasoning, events, fallback }) {
  if (!reasoning) return null;

  return (
    <div className="mb-6 border rounded p-4 bg-slate-50">
      <h2 className="font-semibold mb-2">🧠 Agent Assessment</h2>

      <p className="text-sm text-gray-700 whitespace-pre-line">
        {reasoning}
      </p>

      {events && Object.keys(events).length > 0 && (
        <div className="mt-3 text-sm">
          <strong>Events applied:</strong>
          <pre className="bg-white border mt-1 p-2 rounded text-xs">
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>
      )}

      {fallback && (
        <div className="mt-3 text-red-600 text-sm font-semibold">
          ⚠️ Fallback logic was used
        </div>
      )}
    </div>
  );
}
