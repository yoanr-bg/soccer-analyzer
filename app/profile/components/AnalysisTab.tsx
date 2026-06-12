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

function getFeedback(rating: number) {
  if (rating >= 8.5) return "Excellent";
  if (rating >= 7) return "Decent";
  if (rating >= 6.5) return "Average";
  return "Weak";
}

export default function AnalysisTab({
  averages,
}: {
  averages: Record<
    string,
    { rating: string; positive: Record<string, string>; negative: Record<string, string> }
  >;
}) {
  const positions = Object.keys(averages);
  const [selectedPos, setSelectedPos] = useState(positions[0] || "");

  if (positions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-16">
        No performance data yet. Start by submitting a match rating.
      </div>
    );
  }

  const data = averages[selectedPos];
  if (!data) return null;

  const ratingNum = Number(data.rating);

  return (
    <div className="space-y-6">
      {/* Position Selector */}
      <div className="flex items-center gap-3">
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
      </div>

      {/* Rating Card */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Average Rating</span>
          <span className="text-gray-500 text-xs">{getFeedback(ratingNum)}</span>
        </div>
        <div className="text-5xl font-extrabold" style={{ color: getRatingColor(ratingNum) }}>
          {data.rating}
        </div>
      </div>

      {/* Strengths */}
      {Object.keys(data.positive).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-green-700/40">
          <h3 className="text-green-400 font-bold text-lg mb-3">Key Strengths</h3>
          <div className="space-y-2">
            {Object.entries(data.positive).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
                <span className="text-gray-300 text-sm">{k}</span>
                <span className="text-green-400 font-bold text-sm">+{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {Object.keys(data.negative).length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-red-700/40">
          <h3 className="text-red-400 font-bold text-lg mb-3">Weaknesses</h3>
          <div className="space-y-2">
            {Object.entries(data.negative).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
                <span className="text-gray-300 text-sm">{k}</span>
                <span className="text-red-400 font-bold text-sm">{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
