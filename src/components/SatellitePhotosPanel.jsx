import { useEffect, useState } from "react";

const ZONES = [
  {
    id: "Z1",
    original: "src/photos/eq-img1.jpeg",
    analyzed: "src/photos/eq-img1-analyzed.jpeg",
  },
  {
    id: "Z2",
    original: "src/photos/eq-img2.jpeg",
    analyzed: "src/photos/eq-img2-analyzed.jpeg",
  },
  {
    id: "Z3",
    original: "src/photos/eq-img3.jpeg",
    analyzed: "src/photos/eq-img3-analyzed.jpeg",
  },
];

export default function SatellitePhotosPanel({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);

    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearInterval(dotTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  return (
    <div className="relative mt-4 border rounded-lg bg-gray-50 p-4">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <h3 className="font-semibold mb-4">🛰 Satellite Imagery Analysis</h3>

      {loading ? (
        <div className="text-gray-600">
          Processing satellite images{dots}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-3 gap-4 min-w-[700px]">
            {ZONES.map((zone) => (
              <div key={zone.id} className="space-y-3">
                <div className="text-center font-medium">
                  Zone {zone.id}
                </div>

                {/* Original */}
                <div className="border rounded overflow-hidden bg-white shadow-sm">
                  <img
                    src={zone.original}
                    alt={`Zone ${zone.id} original`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="text-xs p-2 text-gray-600 text-center">
                    Original
                  </div>
                </div>

                {/* Analyzed */}
                <div className="border rounded overflow-hidden bg-white shadow-sm">
                  <img
                    src={zone.analyzed}
                    alt={`Zone ${zone.id} analyzed`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="text-xs p-2 text-gray-600 text-center">
                    Damage detected
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
