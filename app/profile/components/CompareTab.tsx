"use client";
import { useState } from "react";
import { statLabels } from "../../lib/statDefs";

function getRatingColor(rating: number): string {
  if (rating < 6) return "#DC0C00";
  if (rating < 6.5) return "#ED7E07";
  if (rating < 7) return "#E4CE6F";
  if (rating < 8) return "#00C424";
  if (rating < 9) return "#00ADC4";
  return "#374DF5";
}

function getOverallRating(
  avgs: Record<string, { rating: string }>
): string {
  const vals = Object.values(avgs).map((a) => Number(a.rating));
  return vals.length
    ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
    : "—";
}

export default function CompareTab({
  allStats,
  seasons,
}: {
  allStats: { id: string; position: string; rating: number; stats: Record<string, number> }[];
  seasons: { id: string; season_name: string; averages: Record<string, { rating: string; stats: Record<string, string> }> }[];
}) {
  const positions = Array.from(new Set(allStats.map((s) => s.position))).sort();
  const [currentPos, setCurrentPos] = useState("overall");
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasons[0]?.id || "");
  const [pastPos, setPastPos] = useState("overall");

  const currentPositions = ["overall", ...positions];
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const pastPositions = selectedSeason
    ? ["overall", ...Object.keys(selectedSeason.averages)]
    : ["overall"];

  const formatPos = (p: string) =>
    p === "overall"
      ? "Overall Rating"
      : p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Current avg per position
  const grouped: Record<string, any[]> = {};
  allStats.forEach((s) => {
    if (!grouped[s.position]) grouped[s.position] = [];
    grouped[s.position].push(s);
  });

  function getPosStats(pos: string): Record<string, string> {
    const entries = grouped[pos] || [];
    if (!entries.length) return {};
    const sums: Record<string, number> = {};
    entries.forEach((e) => {
      Object.entries(e.stats || {}).forEach(([k, v]) => {
        sums[k] = (sums[k] || 0) + (v as number);
      });
    });
    const avg: Record<string, string> = {};
    Object.entries(sums).forEach(([k, v]) => {
      avg[k] = (v / entries.length).toFixed(1);
    });
    return avg;
  }

  const currentRating =
    currentPos === "overall"
      ? getOverallRating(
          Object.fromEntries(positions.map((p) => [p, { rating: (grouped[p]?.length ? (grouped[p].reduce((a: number, e: any) => a + Number(e.rating), 0) / grouped[p].length).toFixed(2) : "0") }]))
        )
      : grouped[currentPos]?.length
        ? (grouped[currentPos].reduce((a: number, e: any) => a + Number(e.rating), 0) / grouped[currentPos].length).toFixed(2)
        : "—";

  const seasonRating =
    pastPos === "overall"
      ? getOverallRating(selectedSeason?.averages || {})
      : selectedSeason?.averages?.[pastPos]?.rating || "—";

  const currentStats = currentPos === "overall"
    ? (() => {
        const merged: Record<string, string> = {};
        positions.forEach((p) => {
          const ps = getPosStats(p);
          Object.entries(ps).forEach(([k, v]) => {
            if (!merged[k]) merged[k] = v;
          });
        });
        return merged;
      })()
    : getPosStats(currentPos);

  const pastStats = pastPos === "overall"
    ? (() => {
        const merged: Record<string, string> = {};
        if (!selectedSeason) return merged;
        Object.values(selectedSeason.averages).forEach((a: any) => {
          Object.entries(a.stats || {}).forEach(([k, v]) => {
            if (!merged[k]) merged[k] = v as string;
          });
        });
        return merged;
      })()
    : selectedSeason?.averages?.[pastPos]?.stats || {};

  const allStatKeys = Array.from(new Set([...Object.keys(currentStats), ...Object.keys(pastStats)])).sort();

  if (seasons.length === 0) {
    return (
      <div className="text-gray-500 text-center py-16">
        No past seasons saved yet. Save a season to compare your performance over time.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
        <div>
          <label className="text-gray-400 text-xs block mb-1">Current Position</label>
          <select
            value={currentPos}
            onChange={(e) => setCurrentPos(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 text-sm"
          >
            {currentPositions.map((p) => (
              <option key={p} value={p}>{formatPos(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs block mb-1">Past Season</label>
          <select
            value={selectedSeasonId}
            onChange={(e) => { setSelectedSeasonId(e.target.value); setPastPos("overall"); }}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 text-sm"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.season_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs block mb-1">Past Season Position</label>
          <select
            value={pastPos}
            onChange={(e) => setPastPos(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 text-sm"
          >
            {pastPositions.map((p) => (
              <option key={p} value={p}>{formatPos(p)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rating Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-teal-700/50">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current — {formatPos(currentPos)}</div>
          <div className="text-4xl font-extrabold" style={{ color: currentRating !== "—" ? getRatingColor(Number(currentRating)) : "#6b7280" }}>
            {currentRating}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            {selectedSeason?.season_name || "Season"} — {formatPos(pastPos)}
          </div>
          <div className="text-4xl font-extrabold" style={{ color: seasonRating !== "—" ? getRatingColor(Number(seasonRating)) : "#6b7280" }}>
            {seasonRating}
          </div>
        </div>
      </div>

      {/* Stat comparison table */}
      {allStatKeys.length > 0 && (
        <div className="flex-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-auto min-h-0">
          <div className="p-5">
            <h3 className="text-teal-400 font-bold text-lg mb-3 sticky top-0 bg-gray-800/50">Stat Averages</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 uppercase tracking-wider px-2 py-1.5 border-b border-gray-700">
                <span>Stat</span>
                <span className="text-center">Current</span>
                <span className="text-center">{selectedSeason?.season_name || "Past"}</span>
              </div>
              {allStatKeys.map((key) => {
                const label = statLabels[key] || key;
                const cur = currentStats[key];
                const past = pastStats[key];
                const curN = cur ? Number(cur) : null;
                const pastN = past ? Number(past) : null;
                const diff = curN !== null && pastN !== null ? (curN - pastN).toFixed(1) : null;
                return (
                  <div key={key} className="grid grid-cols-3 gap-4 text-sm px-2 py-2 border-b border-gray-700/50 last:border-0 items-center">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-center text-white font-semibold">{cur || "—"}</span>
                    <span className="text-center text-white font-semibold">{past || "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
