"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const positions = [
  "striker", "left_winger", "right_winger", "attacking_mid",
  "central_mid", "defensive_mid", "left_back", "right_back",
  "left_center_back", "right_center_back", "goalkeeper",
];

function getRatingColor(rating: number): string {
  if (rating < 6) return '#DC0C00';
  if (rating < 6.5) return '#ED7E07';
  if (rating < 7) return '#E4CE6F';
  if (rating < 8) return '#00C424';
  if (rating < 9) return '#00ADC4';
  return '#374DF5';
}

export default function ProfilePage() {
  const router = useRouter();
  const [newSeasonModalOpen, setNewSeasonModalOpen] = useState(false);
  const [seasonInput, setSeasonInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [averages, setAverages] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const u = JSON.parse(storedUser);
    setUser(u);
    loadStats(u);
  }, []);

  const loadStats = async (u: any) => {
    setLoading(true);

    // Fetch all stats for this user from Supabase
    const { data: rows, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", u.id);

    if (error) {
      console.error("Error loading stats:", error.message);
      // Fall back to localStorage if Supabase fails
      loadFromLocalStorage(u);
      return;
    }

    // Group by position and calculate averages
    const grouped: Record<string, any[]> = {};
    rows?.forEach((row: any) => {
      if (!grouped[row.position]) grouped[row.position] = [];
      grouped[row.position].push(row);
    });

    const avgRatings: any = {};
    positions.forEach((pos) => {
      const entries = grouped[pos] || [];
      if (entries.length > 0) {
        const sumRating = entries.reduce((total: number, e: any) => total + Number(e.rating), 0);
        const avgRating = (sumRating / entries.length).toFixed(2);

        const sumPositive: Record<string, number> = {};
        const sumNegative: Record<string, number> = {};

        entries.forEach((e: any) => {
          const pos_arr = Array.isArray(e.positive) ? e.positive : [];
          const neg_arr = Array.isArray(e.negative) ? e.negative : [];
          pos_arr.forEach((stat: any) => { sumPositive[stat.label] = (sumPositive[stat.label] || 0) + stat.value; });
          neg_arr.forEach((stat: any) => { sumNegative[stat.label] = (sumNegative[stat.label] || 0) + stat.value; });
        });

        const avgPositive: Record<string, string> = Object.fromEntries(
          Object.entries(sumPositive).map(([k, v]) => [k, (v / entries.length).toFixed(1)])
        );
        const avgNegative: Record<string, string> = Object.fromEntries(
          Object.entries(sumNegative).map(([k, v]) => [k, (v / entries.length).toFixed(1)])
        );

        avgRatings[pos] = { rating: avgRating, positive: avgPositive, negative: avgNegative };
      }
    });

    setAverages(avgRatings);
    setLoading(false);
  };

  const loadFromLocalStorage = (u: any) => {
    const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
    const userStats = savedStats[u.id] || {};
    const avgRatings: any = {};

    positions.forEach((pos) => {
      const entries = userStats[pos] || [];
      if (entries.length > 0) {
        const sumRating = entries.reduce((total: number, e: any) => total + e.rating, 0);
        const avgRating = (sumRating / entries.length).toFixed(2);
        const sumPositive: Record<string, number> = {};
        const sumNegative: Record<string, number> = {};
        entries.forEach((e: any) => {
          e.positive?.forEach((stat: any) => { sumPositive[stat.label] = (sumPositive[stat.label] || 0) + stat.value; });
          e.negative?.forEach((stat: any) => { sumNegative[stat.label] = (sumNegative[stat.label] || 0) + stat.value; });
        });
        const avgPositive: Record<string, string> = Object.fromEntries(
          Object.entries(sumPositive).map(([k, v]) => [k, (v / entries.length).toFixed(1)])
        );
        const avgNegative: Record<string, string> = Object.fromEntries(
          Object.entries(sumNegative).map(([k, v]) => [k, (v / entries.length).toFixed(1)])
        );
        avgRatings[pos] = { rating: avgRating, positive: avgPositive, negative: avgNegative };
      }
    });

    setAverages(avgRatings);
    setLoading(false);
  };

  const handleSaveSeason = async () => {
    if (!seasonInput || !user) return;

    const seasonData = {
      id: Date.now().toString(),
      user_id: user.id,
      season_name: seasonInput,
      averages,
      raw_stats: {},
      created_at: new Date().toISOString(),
    };

    // Save to Supabase
    const { error } = await supabase.from("past_seasons").insert(seasonData);
    if (error) {
      alert("Failed to save season: " + error.message);
      return;
    }

    // Also save to localStorage as backup
    const pastSeasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
    pastSeasons.push({
      id: seasonData.id,
      userId: user.id,
      seasonName: seasonInput,
      createdAt: seasonData.created_at,
      averages,
      rawStats: {},
    });
    localStorage.setItem("pastSeasons", JSON.stringify(pastSeasons));

    // Clear current stats from Supabase
    await supabase.from("player_stats").delete().eq("user_id", user.id);

    // Clear localStorage stats too
    const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
    savedStats[user.id] = {};
    localStorage.setItem("playerStats", JSON.stringify(savedStats));

    alert("Season saved! View it in Past Seasons.");
    setNewSeasonModalOpen(false);
    setSeasonInput("");
    setAverages({});
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const { error: statsError } = await supabase
      .from("player_stats")
      .delete()
      .eq("user_id", user.id);

    if (statsError) {
      alert("Failed to delete stats: " + statsError.message);
      return;
    }

    const { error: seasonsError } = await supabase
      .from("past_seasons")
      .delete()
      .eq("user_id", user.id);

    if (seasonsError) {
      alert("Failed to delete seasons: " + seasonsError.message);
      return;
    }

    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (userError) {
      alert("Failed to delete account: " + userError.message);
      return;
    }

    localStorage.clear();
    router.push("/login");
  };

  const handleViewPastSeasons = async () => {
    const { data, error } = await supabase
      .from("past_seasons")
      .select("*")
      .eq("user_id", user.id);

    if (error || !data || data.length === 0) {
      // Fall back to localStorage check
      const local = JSON.parse(localStorage.getItem("pastSeasons") || "[]")
        .filter((s: any) => s.userId === user.id);
      if (local.length === 0) { alert("No past seasons saved yet."); return; }
    }

    router.push("/seasons");
  };

  const getFeedback = (rating: number) => {
    if (rating >= 8.5) return "Excellent — keep doing what you're doing!";
    if (rating >= 7) return "Decent performance — keep improving consistency.";
    if (rating >= 6.5) return "Average — work on the things you see below.";
    return "Weak — focus on the fundamentals.";
  };

  if (!user) return <div className="text-white p-8 bg-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-900 p-4 sm:p-6 text-white relative font-mono">

      {/* Top Bar */}
      <div className="w-full bg-gray-800 px-4 sm:px-8 py-4 sm:py-6 rounded-lg mb-6 sm:mb-8 shadow-lg relative flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-teal-400">Player Profile</h1>

        <div className="flex flex-wrap gap-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-5">
          <button onClick={() => setNewSeasonModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors shadow-md text-sm sm:text-base">
            + New Season
          </button>
          <button onClick={handleViewPastSeasons}
            className="bg-gray-800 hover:bg-gray-700 text-teal-400 border border-teal-500 py-2 px-3 sm:px-4 rounded-lg transition-all shadow-md text-sm sm:text-base">
            📂 Past Seasons
          </button>
        </div>

        <div className="flex gap-2 sm:absolute sm:top-5 sm:right-8 self-start sm:self-auto">
          <button onClick={() => { localStorage.removeItem("user"); router.push("/login"); }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors text-sm sm:text-base">
            Logout
          </button>
          <button onClick={() => setDeleteModalOpen(true)}
            className="bg-gray-700 hover:bg-red-700 text-red-400 hover:text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors text-sm sm:text-base border border-red-800/50">
            Delete Account
          </button>
        </div>
      </div>

      {/* New Season Modal */}
      {newSeasonModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-teal-400 font-bold text-xl mb-4">Name Current Season</h2>
            <input type="text" value={seasonInput} onChange={(e) => setSeasonInput(e.target.value)}
              placeholder="e.g., Fall 2024"
              className="w-full bg-gray-900 border-2 border-gray-600 text-white py-2 px-3 rounded-lg focus:border-teal-400 outline-none placeholder-gray-500" />
            <div className="flex justify-end mt-4 gap-3">
              <button onClick={() => setNewSeasonModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded-lg">Cancel</button>
              <button onClick={handleSaveSeason}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900 py-1 px-4 rounded-lg font-bold transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-red-800/50">
            <h2 className="text-red-400 font-bold text-xl mb-2">Delete Account</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently delete your account, stats, and seasons. This action cannot be undone.
            </p>
            <p className="text-gray-300 text-sm mb-3">
              Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
            </p>
            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full bg-gray-900 border-2 border-gray-600 text-white py-2 px-3 rounded-lg focus:border-red-500 outline-none placeholder-gray-500 mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(""); }}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== "DELETE"}
                className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-gray-700 pb-6">
        <img
          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "?")}&background=0f766e&color=fff&size=128`}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-teal-400 shadow-xl flex-shrink-0"
          alt={`${user.name}'s profile picture`} />
        <h2 className="text-3xl sm:text-6xl font-extrabold text-white">{user.name}</h2>
      </div>

      {/* Average Ratings Section */}
      <h2 className="text-xl sm:text-3xl font-semibold mb-6 text-teal-400 border-b border-gray-700 pb-2">
        <span className="text-gray-600">// </span> Position Performance Analysis
      </h2>

      {loading ? (
        <div className="text-gray-400 text-center py-10">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20">
          {positions.filter((pos) => averages[pos]).map((pos) => (
            <div key={pos}
              className="bg-gray-800 p-4 sm:p-5 rounded-xl shadow-2xl border-2 border-gray-700 hover:border-teal-500 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="capitalize text-lg sm:text-2xl font-bold text-white tracking-wider">
                  {pos.replace(/_/g, " ")}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold bg-gray-900 px-3 py-1 rounded-lg">
                  <span style={{ color: getRatingColor(averages[pos].rating) }}>{averages[pos].rating}</span>
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 border-t border-gray-700 pt-3">
                {getFeedback(Number(averages[pos].rating))}
              </p>

              {Object.keys(averages[pos].positive).length > 0 && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-green-700/50">
                  <strong className="text-green-400 text-base sm:text-lg block mb-1">Top Positive Stats (per game):</strong>
                  <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                    {Object.entries(averages[pos].positive).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className="text-green-500">{k}</span>
                        <span className="font-semibold text-green-400">+{v as string}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(averages[pos].negative).length > 0 && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-red-700/50">
                  <strong className="text-red-400 text-base sm:text-lg block mb-1">Top Negative Stats (per game):</strong>
                  <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                    {Object.entries(averages[pos].negative).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className="text-red-500">{k}</span>
                        <span className="font-semibold text-red-400">-{v as string}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {Object.keys(averages).length === 0 && (
            <div className="md:col-span-3 text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-gray-500 text-lg">
                <span className="text-teal-400">---</span> No performance data available yet. <span className="text-teal-400">---</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">Submit a match rating to begin your analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* Home Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-teal-500/50 backdrop-blur-sm">
        <div className="max-w-md mx-auto text-center">
          <button onClick={() => router.push("/")}
            className="w-full sm:w-70 bg-teal-500 text-gray-900 font-extrabold text-lg sm:text-xl py-3 rounded-xl shadow-lg hover:bg-teal-400 transition-colors duration-200 uppercase tracking-widest">
            Go To Home Page
          </button>
        </div>
      </div>
    </div>
  );
}