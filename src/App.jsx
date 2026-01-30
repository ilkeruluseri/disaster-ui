import { useState } from "react";

const damageColors = {
  High: "bg-red-100 border-red-400",
  Medium: "bg-yellow-100 border-yellow-400",
  Low: "bg-green-100 border-green-400",
};

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const reportDisaster = () => {
    setLoading(true);
    setResults(null);

    // Simulate backend call
    setTimeout(() => {
      setResults([
        { level: "High", area: "City Center", priority: 1 },
        { level: "Medium", area: "Industrial Zone", priority: 2 },
        { level: "Low", area: "Suburbs", priority: 3 },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Disaster Damage Assessment
        </h1>

        <button
          onClick={reportDisaster}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Report Disaster"}
        </button>

        {loading && (
          <p className="mt-4 text-gray-600">
            Analyzing satellite data…
          </p>
        )}

        {results && (
          <div className="mt-6 space-y-3">
            {results.map((item, index) => (
              <div
                key={index}
                className={`border rounded p-4 flex justify-between ${damageColors[item.level]}`}
              >
                <span>
                  <strong>{item.area}</strong> — {item.level} damage
                </span>
                <span>Priority {item.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
