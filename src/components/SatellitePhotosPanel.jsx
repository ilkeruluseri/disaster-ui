import { useEffect, useState } from "react";
import { predictImage } from "../services/api";

/**
 * Mock originals (top row only)
 * In a real flow these would come from satellite fetch
 */
const ORIGINAL_IMAGES = [
  {
    zone: "Z1",
    src: "src/photos/eq-img1.jpeg",
  },
  {
    zone: "Z2",
    src: "src/photos/eq-img2.jpeg",
  },
  {
    zone: "Z3",
    src: "src/photos/eq-img3.jpeg",
  },
  {
    zone: "Z4",
    src: "src/photos/eq-img4.jpeg",
  },
];

export default function SatellitePhotosPanel({ onClose, disasterType = "earthquake", onComplete }) {
  const [items, setItems] = useState([]);
  const [dots, setDots] = useState("");

  /* animated dots */
  useEffect(() => {
    const t = setInterval(() => {
      setDots(d => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(t);
  }, []);

  /* kick off predictions */
  useEffect(() => {
    async function runPredictions() {
      const initialized = await Promise.all(
        ORIGINAL_IMAGES.map(async (img) => {
          // fetch image as File so we can upload it
          const res = await fetch(img.src);
          const blob = await res.blob();
          const file = new File([blob], img.src.split("/").pop(), {
            type: blob.type,
          });

          return {
            zone: img.zone,
            originalSrc: img.src,
            file,
            loading: true,
            result: null,
          };
        })
      );

      setItems(initialized);

      // run predictions sequentially (simpler + clearer demo)
      for (let i = 0; i < initialized.length; i++) {
        try {
          const prediction = await predictImage({
            file: initialized[i].file,
            disasterType,
            save: true,
          });
          console.log("Prediction result:", prediction);

          setItems(prev =>
            prev.map((it, idx) =>
              idx === i
                ? { ...it, loading: false, result: prediction }
                : it
            )
          );
        } catch (err) {
          setItems(prev =>
            prev.map((it, idx) =>
              idx === i
                ? { ...it, loading: false, result: { error: err.message } }
                : it
            )
          );
        }
      }
      console.log("All predictions complete, triggering onComplete", onComplete, items);
      if (onComplete && items) {
        setTimeout(() => onComplete(), 1000);
      }
    }

    runPredictions();
  }, [disasterType]);

  return (
    <div className="relative mt-4 border rounded-lg bg-gray-50 p-4">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <h3 className="font-semibold mb-4">
        🛰 Satellite Imagery Analysis
      </h3>

      <div className="overflow-x-auto">
  <div className="grid grid-rows-2 grid-flow-col auto-cols-[240px] gap-4">

    {items.map((item, idx) => (
      <div key={idx} className="contents">
        {/* TOP: Original */}
        <div className="bg-white border rounded shadow-sm">
          <div className="text-sm font-medium text-center py-1">
            Zone {item.zone} — Original
          </div>
          <div className="aspect-square w-full">
            <img
              src={item.originalSrc}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* BOTTOM: Analysis */}
        <div className="bg-white border rounded shadow-sm">
          <div className="text-sm font-medium text-center py-1">
            Zone {item.zone} — Analysis
          </div>
          <div className="aspect-square w-full flex items-center justify-center">
            {item.loading && (
              <div className="text-gray-600 text-sm">
                Analyzing{dots}
              </div>
            )}

            {!item.loading && item.result?.overlay_url && (
              <img
                src={`http://127.0.0.1:8000${item.result.overlay_url}`}
                className="w-full h-full object-cover"
              />
            )}

            {!item.loading && !item.result?.overlay_url && (
              <div className="text-sm text-gray-500">
                No damage detected
              </div>
            )}
          </div>
        </div>
      </div>
    ))}

  </div>
</div>

    </div>
  );
}
