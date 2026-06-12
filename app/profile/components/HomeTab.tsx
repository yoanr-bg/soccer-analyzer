"use client";
import { useState, useEffect } from "react";
import PerformanceChart from "./PerformanceChart";

const positionCategories: Record<string, string[]> = {
  forward: ["striker", "left_winger", "right_winger"],
  attacking_mid: ["attacking_mid", "central_mid"],
  defensive_mid: ["defensive_mid"],
  defender: ["left_back", "right_back", "left_center_back", "right_center_back"],
  goalkeeper: ["goalkeeper"],
};

const categoryKeyStats: Record<string, string[]> = {
  forward: ["goals", "assists", "shot_creation", "dribbles"],
  attacking_mid: ["assists", "key_passes", "big_chances_made", "passes_opp_half"],
  defensive_mid: ["tackles", "interceptions", "passes_opp_half", "duels_won"],
  defender: ["tackles", "interceptions", "clearances", "blocks", "duels_won"],
  goalkeeper: ["totalSaves", "cleanSheet", "highClaims", "savesInBox"],
};

const statLabels: Record<string, string> = {
  goals: "Goals", assists: "Assists", shot_creation: "Shot Creation", dribbles: "Dribbles",
  key_passes: "Key Passes", big_chances_made: "Big Chances", passes_opp_half: "Passes (Opp Half)",
  tackles: "Tackles", interceptions: "Interceptions", clearances: "Clearances",
  blocks: "Blocks", duels_won: "Duels Won", totalSaves: "Saves", cleanSheet: "Clean Sheets",
  highClaims: "High Claims", savesInBox: "Saves In Box",
};

function getCategoryForPosition(position: string): string | undefined {
  return Object.entries(positionCategories).find(([, v]) => v.includes(position))?.[0];
}

export default function HomeTab({
  allStats,
}: {
  allStats: { id: string; position: string; rating: number; stats: Record<string, number> }[];
}) {
  const [graphFilter, setGraphFilter] = useState("overall");
  const [statsPosition, setStatsPosition] = useState("");

  const uniquePositions = Array.from(new Set(allStats.map((s) => s.position))).sort();
  const defaultPos = statsPosition || uniquePositions[0] || "";

  useEffect(() => {
    if (!statsPosition && uniquePositions.length > 0) {
      setStatsPosition(uniquePositions[0]);
    }
  }, [statsPosition, uniquePositions]);

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

  const posStats = allStats.filter((s) => s.position === defaultPos);
  const posMatches = posStats.length;
  const category = getCategoryForPosition(defaultPos);
  const keys = category ? categoryKeyStats[category] : [];
  const statTotals = keys.map((key) => {
    const sum = posStats.reduce((acc, s) => acc + (s.stats[key] || 0), 0);
    return { label: statLabels[key] || key, value: sum };
  });

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
      {uniquePositions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Key Stats</h3>
            <select
              value={defaultPos}
              onChange={(e) => setStatsPosition(e.target.value)}
              className="bg-gray-700 text-white text-sm border border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:border-teal-500"
            >
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
                  <th className="text-left text-gray-400 font-semibold py-2 pr-4 whitespace-nowrap">Matches</th>
                  {statTotals.map((s) => (
                    <th key={s.label} className="text-left text-gray-400 font-semibold py-2 px-3 whitespace-nowrap">{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 pr-4 font-bold text-teal-400 text-lg">{posMatches}</td>
                  {statTotals.map((s) => (
                    <td key={s.label} className="py-3 px-3 text-white font-semibold">{s.value}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
