"use client";
import { useState, useEffect } from "react";
import PerformanceChart from "./PerformanceChart";
import { statLabels } from "../../lib/statDefs";

const positionCategories: Record<string, string[]> = {
  forward: ["striker", "left_winger", "right_winger"],
  attacking_mid: ["attacking_mid", "central_mid"],
  defensive_mid: ["defensive_mid"],
  defender: ["left_back", "right_back", "left_center_back", "right_center_back"],
  goalkeeper: ["goalkeeper"],
};

const categoryKeyStats: Record<string, string[]> = {
  forward: ["goals", "assists", "big_chances_made", "dribbles"],
  attacking_mid: ["goals", "assists", "key_passes", "big_chances_made"],
  central_mid: ["assists", "key_passes", "passes_own_half", "passes_opp_half"],
  defensive_mid: ["tackles", "interceptions", "passes_opp_half", "duels_won"],
  defender: ["tackles", "interceptions", "clearances", "blocks", "duels_won"],
  goalkeeper: ["totalSaves", "cleanSheet", "highClaims", "savesInBox"],
};

function getRatingColor(rating: number): string {
  if (rating < 6) return "#DC0C00";
  if (rating < 6.5) return "#ED7E07";
  if (rating < 7) return "#E4CE6F";
  if (rating < 8) return "#00C424";
  if (rating < 9) return "#00ADC4";
  return "#374DF5";
}

function getCategoryForPosition(position: string): string | undefined {
  return Object.entries(positionCategories).find(([, v]) => v.includes(position))?.[0];
}

export default function HomeTab({
  allStats,
}: {
  allStats: { id: string; position: string; rating: number; stats: Record<string, number> }[];
}) {
  const [graphFilter, setGraphFilter] = useState("overall");
  const [statsPosition, setStatsPosition] = useState("overall");

  const uniquePositions = Array.from(new Set(allStats.map((s) => s.position))).sort();

  const graphOptions = [
    { value: "overall", label: "Overall" },
    ...uniquePositions.map((p) => ({
      value: p,
      label: p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
  ];

  const filteredStats =
    graphFilter === "overall"
      ? allStats
      : allStats.filter((s) => s.position === graphFilter);

  const chartData = filteredStats
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((s, i) => ({ label: `#${i + 1}`, rating: s.rating }));

  const isOverall = statsPosition === "overall";
  const overallStatKeys = ["goals", "assists", "big_chances_made", "dribbles"];

  const posStats = isOverall ? allStats : allStats.filter((s) => s.position === statsPosition);
  const posMatches = posStats.length;
  const posAvgRating = posMatches
    ? (posStats.reduce((acc, s) => acc + Number(s.rating), 0) / posMatches).toFixed(2)
    : "—";

  const statKeys = isOverall
    ? overallStatKeys
    : (categoryKeyStats[getCategoryForPosition(statsPosition) || ""] || []);
  const statTotals = statKeys.map((key) => {
    const sum = posStats.reduce((acc, s) => acc + (s.stats[key] || 0), 0);
    return { label: statLabels[key] || key, value: sum };
  });

  const [showAllMatches, setShowAllMatches] = useState(false);

  const sortedMatches = [...allStats].sort((a, b) => Number(b.id) - Number(a.id));
  const recentMatches = sortedMatches.slice(0, 5);
  const displayMatches = showAllMatches ? sortedMatches : recentMatches;

  const [selectedMatch, setSelectedMatch] = useState<(typeof allStats)[number] | null>(null);

  return (
    <div className="space-y-6">
      {/* New Match button */}
      <div className="flex justify-end">
        <a
          href="/new-match"
          className="bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-md"
        >
          + New Match
        </a>
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Performance Trend</h3>
          <select
            value={graphFilter}
            onChange={(e) => setGraphFilter(e.target.value)}
            className="bg-gray-700 text-white text-sm border border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:border-teal-500"
          >
            {graphOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <PerformanceChart data={chartData} />
      </div>

      {/* Key Stats Table */}
      {allStats.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Key Stats</h3>
            <select
              value={statsPosition}
              onChange={(e) => setStatsPosition(e.target.value)}
              className="bg-gray-700 text-white text-sm border border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:border-teal-500"
            >
              <option value="overall">Overall</option>
              {uniquePositions.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-semibold py-2 pr-4 whitespace-nowrap">Avg Rating</th>
                  <th className="text-left text-gray-400 font-semibold py-2 px-3 whitespace-nowrap">Matches</th>
                  {statTotals.map((s) => (
                    <th key={s.label} className="text-left text-gray-400 font-semibold py-2 px-3 whitespace-nowrap">{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 pr-4 font-bold text-teal-400">{posAvgRating}</td>
                  <td className="py-3 px-3 font-bold text-white">{posMatches}</td>
                  {statTotals.map((s) => (
                    <td key={s.label} className="py-3 px-3 text-white font-semibold">{s.value}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent / All Matches */}
      {sortedMatches.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-3">
            {showAllMatches ? "All Matches" : "Recent Matches"}
          </h3>
          <div className="space-y-2">
            {displayMatches.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className="w-full flex items-center justify-between bg-gray-700/30 hover:bg-gray-700/60 rounded-lg px-4 py-3 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-400 text-xs shrink-0">
                    {new Date(Number(m.id)).toLocaleDateString()}
                  </span>
                  <span className="text-gray-300 text-sm capitalize truncate">
                    {m.position.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="font-bold text-lg shrink-0" style={{ color: getRatingColor(Number(m.rating)) }}>
                  {Number(m.rating).toFixed(1)}
                </span>
              </button>
            ))}
          </div>
          {sortedMatches.length > 5 && (
            <button
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="mt-3 w-full text-center text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors py-2"
            >
              {showAllMatches ? "Show Less" : `View All (${sortedMatches.length})`}
            </button>
          )}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-white font-bold text-lg capitalize">
                  {selectedMatch.position.replace(/_/g, " ")}
                </h3>
                <p className="text-gray-400 text-xs">
                  {new Date(Number(selectedMatch.id)).toLocaleDateString()}
                </p>
              </div>
              <span className="text-3xl font-extrabold" style={{ color: getRatingColor(Number(selectedMatch.rating)) }}>
                {Number(selectedMatch.rating).toFixed(1)}
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedMatch.stats || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between bg-gray-700/30 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-sm">{statLabels[key] || key}</span>
                    <span className="text-white font-semibold text-sm">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-5 rounded-lg font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
