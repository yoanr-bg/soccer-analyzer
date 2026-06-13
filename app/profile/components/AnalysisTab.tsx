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

function getFeedback(rating: number) {
  if (rating >= 8.5) return "Excellent";
  if (rating >= 7) return "Decent";
  if (rating >= 6.5) return "Average";
  return "Weak";
}

const positiveStatKeys = new Set([
  "goals", "assists", "tackles", "interceptions", "key_passes",
  "big_chances_made", "duels_won", "recoveries", "clearances", "blocks",
  "cleanSheet", "totalSaves", "savesInBox", "punches", "runsOut",
  "highClaims", "penaltySaved", "goal_line_clearances", "fouls_won",
  "crosses", "dribbles", "passes_opp_half", "longBallsAccurate",
]);

const negativeStatKeys = new Set([
  "errors_chance", "mistakes", "big_chances_missed", "yellow_cards",
  "red_card", "duels_lost", "goalsConceded", "unsucessfullRunsOut",
  "gkErrorShot", "gkErrorGoal", "penaltyConceded", "off_target_shots",
  "unsuccessful_touches", "dribbled_past", "fouls_committed",
  "possession_lost", "penalties_missed", "crosses_missed",
  "passes_missed_oh", "passes_missed_ah", "longBallMissed",
  "penalties_committed", "gkErrorShot", "gkErrorGoal",
]);

export default function AnalysisTab({
  allStats,
}: {
  allStats: { id: string; position: string; rating: number; stats: Record<string, number> }[];
}) {
  const positions = Array.from(new Set(allStats.map((s) => s.position))).sort();
  const [selectedPos, setSelectedPos] = useState(positions[0] || "");

  if (positions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-16">
        No performance data yet. Start by submitting a match rating.
      </div>
    );
  }

  const posStats = allStats.filter((s) => s.position === selectedPos);
  const posMatches = posStats.length;
  const avgRating = posMatches
    ? (posStats.reduce((a, s) => a + Number(s.rating), 0) / posMatches).toFixed(2)
    : "—";

  const sumStats: Record<string, number> = {};
  const allKeys = new Set<string>();
  posStats.forEach((s) => {
    Object.entries(s.stats || {}).forEach(([k, v]) => {
      allKeys.add(k);
      sumStats[k] = (sumStats[k] || 0) + v;
    });
  });

  const strengths: { label: string; val: string }[] = [];
  const weaknesses: { label: string; val: string }[] = [];

  allKeys.forEach((key) => {
    const avg = sumStats[key] / posMatches;
    const label = statLabels[key] || key;
    if (positiveStatKeys.has(key)) {
      strengths.push({ label, val: avg.toFixed(1) });
    } else {
      weaknesses.push({ label, val: avg.toFixed(1) });
    }
  });

  strengths.sort((a, b) => Number(b.val) - Number(a.val));
  weaknesses.sort((a, b) => Number(b.val) - Number(a.val));

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <label className="text-gray-400 text-sm">Position:</label>
        <select
          value={selectedPos}
          onChange={(e) => setSelectedPos(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-teal-500 text-sm"
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <span className="text-gray-500 text-xs">{posMatches} matches</span>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Average Rating</span>
          <span className="text-gray-500 text-xs">{getFeedback(Number(avgRating))}</span>
        </div>
        <div className="text-5xl font-extrabold" style={{ color: getRatingColor(Number(avgRating)) }}>
          {avgRating}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-0">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-green-700/40 overflow-auto">
          <h3 className="text-green-400 font-bold text-lg mb-3 sticky top-0 bg-gray-800/50">Key Strengths</h3>
          <div className="space-y-2">
            {strengths.map((s) => (
              <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
                <span className="text-gray-300 text-sm">{s.label}</span>
                <span className="text-green-400 font-bold text-sm">{s.val} /g</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-5 border border-red-700/40 overflow-auto">
          <h3 className="text-red-400 font-bold text-lg mb-3 sticky top-0 bg-gray-800/50">Weaknesses</h3>
          <div className="space-y-2">
            {weaknesses.map((s) => (
              <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
                <span className="text-gray-300 text-sm">{s.label}</span>
                <span className="text-red-400 font-bold text-sm">{s.val} /g</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
