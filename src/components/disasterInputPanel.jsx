export default function DisasterInputPanel({ onRun, loading }) {
  return (
    <div className="mb-6">
      <button
        onClick={onRun}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "Run Allocation"}
      </button>
    </div>
  );
}
