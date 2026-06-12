"use client";
import { useState } from "react";

function getRatingColor(rating: number): string {
  if (rating < 6) return "#DC0C00";
  if (rating < 6.5) return "#ED7E07";
  if (rating < 7) return "#E4CE6F";
  if (rating < 8) return "#00C424";
  if (rating < 9) return "#00ADC4";
  return "#374DF5";
}

function getOverallRating(avgs: Record<string, { rating: string }>): string {
  const vals = Object.values(avgs).map((a) => Number(a.rating));
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "—";
}

export default function CompareTab({
  averages,
  seasons,
}: {
  averages: Record<string, { rating: string }>;
  seasons: { id: string; season_name: string; averages: Record<string, { rating: string }> }[];
}) {
  const [currentPos, setCurrentPos] = useState("overall");
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasons[0]?.id || "");
  const [pastPos, setPastPos] = useState("overall");

  const currentPositions = ["overall", ...Object.keys(averages)];
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const pastPositions = selectedSeason
    ? ["overall", ...Object.keys(selectedSeason.averages)]
    : ["overall"];

  const formatPos = (p: string) =>
    p === "overall" ? "Overall Rating" : p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const currentRating =
    currentPos === "overall" ? getOverallRating(averages) : averages[currentPos]?.rating || "—";
  const seasonRating =
    pastPos === "overall"
      ? getOverallRating(selectedSeason?.averages || {})
      : selectedSeason?.averages?.[pastPos]?.rating || "—";

  const currentNum = currentRating !== "—" ? Number(currentRating) : null;
  const seasonNum = seasonRating !== "—" ? Number(seasonRating) : null;
  const diff = currentNum !== null && seasonNum !== null ? (currentNum - seasonNum).toFixed(2) : null;

  if (seasons.length === 0) {
    return (
      <div className="text-gray-500 text-center py-16">
        No past seasons saved yet. Save a season to compare your performance over time.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-teal-700/50">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current — {formatPos(currentPos)}</div>
          <div className="text-4xl font-extrabold" style={{ color: currentNum ? getRatingColor(currentNum) : "#6b7280" }}>
            {currentRating}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            {selectedSeason?.season_name || "Season"} — {formatPos(pastPos)}
          </div>
          <div className="text-4xl font-extrabold" style={{ color: seasonNum ? getRatingColor(seasonNum) : "#6b7280" }}>
            {seasonRating}
          </div>
        </div>
      </div>

      {/* Diff */}
      {diff !== null && (
        <div
          className={`rounded-xl p-4 text-center border ${
            Number(diff) >= 0
              ? "bg-green-900/20 border-green-700/40 text-green-400"
              : "bg-red-900/20 border-red-700/40 text-red-400"
          }`}
        >
          <span className="text-lg font-bold">
            {Number(diff) >= 0 ? "+" : ""}
            {diff} vs {selectedSeason?.season_name}
          </span>
        </div>
      )}
    </div>
  );
}
