import { useEffect, useMemo, useState } from "react";
import { getFloodRisk } from "../services/api";

function severityRank(sev) {
  if (sev?.startsWith("MAJOR")) return 4;
  if (sev?.startsWith("MODERATE")) return 3;
  if (sev?.startsWith("MINOR")) return 2;
  return 1;
}

function severityBadge(sev) {
  const base = "text-xs font-semibold px-2 py-1 rounded-full";
  if (sev?.startsWith("MAJOR")) return `${base} bg-red-600 text-white`;
  if (sev?.startsWith("MODERATE")) return `${base} bg-orange-500 text-white`;
  if (sev?.startsWith("MINOR")) return `${base} bg-yellow-300 text-gray-900`;
  return `${base} bg-gray-200 text-gray-800`;
}

function fmtPct(x) {
  if (x === undefined || x === null || Number.isNaN(x)) return "-";
  return `${(x * 100).toFixed(1)}%`;
}
function fmtDateShort(s) {
    if (!s) return "-";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    // 2 Feb 2026 formatı
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  
  function fmtDateTimeShort(s) {
    if (!s) return "-";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    // 30 Jan 2026, 00:00 formatı
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  function rpLabel(sev) {
    if (sev?.startsWith("MAJOR")) return "≥10-year RP";
    if (sev?.startsWith("MODERATE")) return "≥5-year RP";
    if (sev?.startsWith("MINOR")) return "≥2-year RP";
    return "RP";
  }
  
  // Arama varsa: “matching”, yoksa normal “Showing x–y of z”
  function listHeaderText({ query, page, pageSize, total }) {
    if (total === 0) {
      return query
        ? `No provinces match “${query}”.`
        : "No provinces available.";
    }
    if (query?.trim()) {
      return `${total} province${total === 1 ? "" : "s"} match your search.`;
    }
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return `Showing ${from}–${to} of ${total} provinces.`;
  }
  

function formatSeverity(label) {
  if (!label) return label;
  return String(label).replace(/\s*\(.*\)\s*$/, "").trim();
}

export default function FloodRiskPanel() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState("");


  // ✅ pagination state
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // ✅ 81 çek
      const d = await getFloodRisk(81);
      setData(d);

      // sayfayı resetle
      setPage(1);

      // selected default: en riskli
      const sorted = [...(d.top_provinces || [])].sort((a, b) => {
        const ra = severityRank(a.severity);
        const rb = severityRank(b.severity);
        if (rb !== ra) return rb - ra;
        return (
          (b.metrics?.peak_72h_discharge_max || 0) -
          (a.metrics?.peak_72h_discharge_max || 0)
        );
      });

      setSelected(sorted[0] || null);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ tüm liste (sorted)
    // ✅ tüm liste (sorted + query filtered)
    const list = useMemo(() => {
        const arr = data?.top_provinces ? [...data.top_provinces] : [];
    
        // filter (case-insensitive, TR locale)
        const q = query.trim().toLocaleLowerCase("tr-TR");
        const filtered = q
          ? arr.filter((x) =>
              String(x.province || "")
                .toLocaleLowerCase("tr-TR")
                .includes(q)
            )
          : arr;
    
        // sort (same logic)
        return filtered.sort((a, b) => {
          const ra = severityRank(a.severity);
          const rb = severityRank(b.severity);
          if (rb !== ra) return rb - ra;
          return (
            (b.metrics?.peak_72h_discharge_max || 0) -
            (a.metrics?.peak_72h_discharge_max || 0)
          );
        });
      }, [data, query]);
      useEffect(() => {
        setPage(1);
      }, [query]);
    
    
  // ✅ pagination derived values
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // page clamp (data reload sonrası güvenli olsun)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, page]);

  // ✅ sayfa değişince selected o sayfada yoksa, sayfanın ilkini seç
  useEffect(() => {
    if (!selected) {
      setSelected(pagedList[0] || null);
      return;
    }
    const inPage = pagedList.some((p) => p.province === selected.province);
    if (!inPage) setSelected(pagedList[0] || null);
  }, [page, data]); // data değişince de tetiklenir

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // küçük sayfa numarası barı (1..N) ama çok kalabalık olmasın diye window
  const pageButtons = useMemo(() => {
    const windowSize = 7; // 7 buton max
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
          <h2 className="text-lg font-bold">Flood Risk Assessment</h2>

<p className="text-sm text-gray-700 mt-1">
  Based on <span className="font-semibold">GloFAS river discharge forecasts</span>, highlighting
  potential flood risk for the <span className="font-semibold">next {data?.window_hours || 72} hours</span>.
</p>

<p className="text-xs text-gray-500 mt-1">
  Forecast issued: <span className="font-semibold">{fmtDateTimeShort(data?.forecast_reference_time)}</span>{" "}
  • Return periods:{" "}
  <span className="font-semibold">{(data?.thresholds_used || []).join(", ")}-year</span>{" "}
  • Alert if affected area ≥{" "}
  <span className="font-semibold">{((data?.area_fraction_gate || 0) * 100).toFixed(1)}%</span>
</p>

          </div>

          <button
            onClick={load}
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-gray-600 mt-3">Loading flood risk…</p>}
        {err && <p className="text-red-600 mt-3">❌ {err}</p>}
      </div>

      {/* Content */}
      {/* Content */}
{!loading && !err && data && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left: list */}
    <div className="border rounded-xl bg-white p-4 flex flex-col">
      {/* TOP: Title + Search */}
      <div className="mb-3">
        <h3 className="font-bold">All Provinces</h3>

        <div className="mt-2 relative">
        <input
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
            }}
            placeholder="Search by province name…"
            className="w-full border rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />


          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              aria-label="Clear search"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
            <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                MAJOR: Severe (≥10y)
            </span>
            <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                MODERATE: Elevated (≥5y)
            </span>
            <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-100">
                MINOR: Local (≥2y)
            </span>
            </div>


        {/* Showing info */}
        <p className="text-xs text-gray-500 mt-2">
          {total === 0 ? (
            <>
              No provinces found
              {query ? (
                <>
                  {" "}
                  for <span className="font-semibold">"{query}"</span>
                </>
              ) : null}
            </>
          ) : (
            <>
              Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span>–
              <span className="font-semibold">{Math.min(page * pageSize, total)}</span> of{" "}
              <span className="font-semibold">{total}</span>
              {query ? (
                <>
                  {" "}
                  • Search: <span className="font-semibold">"{query}"</span>
                </>
              ) : null}
            </>
          )}
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-2 flex-1">
        {pagedList.length === 0 ? (
          <div className="text-sm text-gray-500 border rounded-xl p-3">
            No results{query ? <> for “{query}”</> : null}
          </div>
        ) : (
          pagedList.map((p) => {
            const active = selected?.province === p.province;
            return (
              <button
                key={p.province}
                onClick={() => setSelected(p)}
                className={`w-full text-left border rounded-xl p-3 hover:bg-gray-50 transition ${
                  active ? "border-gray-900" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-semibold">{p.province}</div>
                    <div className="text-xs text-gray-500 mt-1">
                Peak discharge: {(p.metrics?.peak_72h_discharge_max ?? 0).toFixed(1)} m³/s •{" "}
                Peak in {p.metrics?.peak_period || "-"} • Valid until {fmtDateShort(p.valid_end)}
                </div>

                  </div>
                  <span className={severityBadge(p.severity)}>{p.severity}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* BOTTOM: Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 mt-4 border-t flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={page === 1}
            className={`px-3 py-2 text-sm rounded-lg border ${
              page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            ‹ Prev
          </button>

          <div className="flex items-center gap-1">
            {pageButtons[0] > 1 && (
              <>
                <button
                  onClick={() => setPage(1)}
                  className="px-2 py-1 text-sm rounded-lg border hover:bg-gray-50"
                >
                  1
                </button>
                <span className="text-xs text-gray-400 px-1">…</span>
              </>
            )}

            {pageButtons.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-2 py-1 text-sm rounded-lg border ${
                  n === page ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}

            {pageButtons[pageButtons.length - 1] < totalPages && (
              <>
                <span className="text-xs text-gray-400 px-1">…</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="px-2 py-1 text-sm rounded-lg border hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={page === totalPages}
            className={`px-3 py-2 text-sm rounded-lg border ${
              page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            Next ›
          </button>
        </div>
      )}
    </div>

    {/* Right: detail (senin mevcut kodun aynı kalacak) */}
    <div className="border rounded-xl bg-white p-4">
      {!selected ? (
        <div className="text-gray-600">Select a province</div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div>

              <div className="text-xl font-bold">
  {selected.province} <span className="text-gray-400 font-semibold">– Flood Risk Summary</span>
</div>

<div className="text-xs text-gray-500 mt-1">
  Peak expected in <span className="font-semibold">{selected.metrics?.peak_period || "-"}</span>{" "}
  • Forecast valid until{" "}
  <span className="font-semibold">{fmtDateShort(selected.valid_end)}</span>
</div>

            </div>
            <span className={severityBadge(selected.severity)}>{selected.severity}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
  <Metric
    label="Maximum river discharge (72h)"
    value={`${(selected.metrics?.peak_72h_discharge_max ?? 0).toFixed(1)} m³/s`}
  />
  <Metric
    label="Flood return period (area)"
    value={`${selected.metrics?.rp_area_years ?? 0}y`}
  />
  <Metric
    label="Flood return period (any river)"
    value={`${selected.metrics?.rp_any_years ?? 0}y`}
  />
  <Metric
    label="Area exceeding 2-year flood"
    value={fmtPct(selected.metrics?.exceed_frac_rp2)}
  />
  <Metric
    label="Area exceeding 5-year flood"
    value={fmtPct(selected.metrics?.exceed_frac_rp5)}
  />
  <Metric
    label="Area exceeding 10-year flood"
    value={fmtPct(selected.metrics?.exceed_frac_rp10)}
  />
</div>


          <div className="border rounded-xl p-3">
            <div className="font-bold mb-2">Why?</div>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
  <li>
    Peak river flow is expected <span className="font-semibold">{selected.metrics?.peak_period || "-"}</span> from now,
    reaching critical levels.
  </li>
  <li>
    Flood magnitude corresponds to a{" "}
    <span className="font-semibold">
      {Math.max(selected.metrics?.rp_area_years ?? 0, selected.metrics?.rp_any_years ?? 0)}-year return period
    </span>
    , indicating a significant event.
  </li>
  <li>
    <span className="font-semibold">{fmtPct(selected.metrics?.exceed_frac_rp2)}</span> of river segments exceed the
    2-year threshold.
  </li>
  <li>
    <span className="font-semibold">{fmtPct(selected.metrics?.exceed_frac_rp5)}</span> exceed the 5-year threshold.
  </li>
  <li>
    <span className="font-semibold">{fmtPct(selected.metrics?.exceed_frac_rp10)}</span> exceed the 10-year threshold.
  </li>
</ul>

          </div>

          <div className="border rounded-xl p-3">
            <div className="font-bold mb-2">Actions</div>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
              {(selected.actions || []).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}
      


function Metric({ label, value }) {
  return (
    <div className="border rounded-xl p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
