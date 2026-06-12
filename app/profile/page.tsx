"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { addToQueue } from "../lib/sync";
import HomeTab from "./components/HomeTab";
import AnalysisTab from "./components/AnalysisTab";
import CompareTab from "./components/CompareTab";
import TrainingTab from "./components/TrainingTab";
import SeasonsTab from "./components/SeasonsTab";

const positions = [
  "striker", "left_winger", "right_winger", "attacking_mid",
  "central_mid", "defensive_mid", "left_back", "right_back",
  "left_center_back", "right_center_back", "goalkeeper",
];

const tabs = [
  { id: "home", label: "Home" },
  { id: "analysis", label: "Analysis" },
  { id: "seasons", label: "Seasons" },
  { id: "training", label: "Training" },
  { id: "compare", label: "Compare" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [newSeasonModalOpen, setNewSeasonModalOpen] = useState(false);
  const [seasonInput, setSeasonInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [averages, setAverages] = useState<any>({});
  const [allStats, setAllStats] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const u = JSON.parse(storedUser);
    setUser(u);
    loadData(u);
  }, []);

  const loadData = async (u: any) => {
    setLoading(true);

    const { data: rows, error } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", u.id);

    let stats: any[] = [];
    if (!error && rows && rows.length > 0) {
      stats = rows;
    } else {
      const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
      const userStats = savedStats[u.id] || {};
      for (const [pos, entries] of Object.entries(userStats)) {
        if (Array.isArray(entries)) {
          entries.forEach((e: any) => {
            stats.push({
              id: e.timestamp?.toString() || Date.now().toString(),
              position: pos,
              rating: e.rating,
              stats: e.stats || {},
              positive: e.positive || [],
              negative: e.negative || [],
            });
          });
        }
      }
    }

    setAllStats(stats);

    const grouped: Record<string, any[]> = {};
    stats.forEach((row: any) => {
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

    const { data: seasonRows } = await supabase
      .from("past_seasons")
      .select("*")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });

    if (seasonRows && seasonRows.length > 0) {
      setSeasons(seasonRows);
    } else {
      const local = JSON.parse(localStorage.getItem("pastSeasons") || "[]")
        .filter((s: any) => s.userId === u.id)
        .map((s: any) => ({
          ...s,
          id: s.id || s._id,
          season_name: s.season_name || s.seasonName,
          created_at: s.created_at || s.createdAt,
        }));
      setSeasons(local);
    }

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

    supabase.from("past_seasons").insert(seasonData).then(({ error }) => {
      if (error) addToQueue({ type: "insert", table: "past_seasons", data: seasonData });
    });

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

    supabase.from("player_stats").delete().eq("user_id", user.id).then(({ error }) => {
      if (error) addToQueue({ type: "delete", table: "player_stats", column: "user_id", value: user.id });
    });

    const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
    savedStats[user.id] = {};
    localStorage.setItem("playerStats", JSON.stringify(savedStats));

    setSeasons((prev) => [seasonData, ...prev]);
    setAverages({});
    setAllStats([]);
    alert("Season saved! View it in Past Seasons.");
    setNewSeasonModalOpen(false);
    setSeasonInput("");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const { error: statsError } = await supabase.from("player_stats").delete().eq("user_id", user.id);
    if (statsError) addToQueue({ type: "delete", table: "player_stats", column: "user_id", value: user.id });

    const { error: seasonsError } = await supabase.from("past_seasons").delete().eq("user_id", user.id);
    if (seasonsError) addToQueue({ type: "delete", table: "past_seasons", column: "user_id", value: user.id });

    const { error: userError } = await supabase.from("users").delete().eq("id", user.id);
    if (userError) addToQueue({ type: "delete", table: "users", column: "id", value: user.id });

    localStorage.clear();
    router.push("/login");
  };

  const handleDeleteSeasons = (ids: string[]) => {
    setSeasons((prev) => prev.filter((s) => !ids.includes(s.id)));
  };

  if (!user) return <div className="text-white p-8 bg-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 px-4 sm:px-8 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-teal-400">PitchIQ</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNewSeasonModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-1.5 px-3 rounded-lg transition-colors text-xs">
            + Season
          </button>
          <button onClick={() => { localStorage.removeItem("user"); router.push("/login"); }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs">
            Logout
          </button>
          <button onClick={() => setDeleteModalOpen(true)}
            className="bg-gray-700 hover:bg-red-700 text-red-400 hover:text-white py-1.5 px-3 rounded-lg text-xs border border-red-800/50">
            Delete
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"} lg:relative lg:block lg:z-auto w-56 bg-gray-800/50 border-r border-gray-700 min-h-[calc(100vh-52px)] flex-shrink-0`}>
          {/* Profile info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "?")}&background=0f766e&color=fff&size=64`}
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                alt=""
              />
              <div>
                <div className="font-bold text-sm text-white">{user.name}</div>
                <div className="text-xs text-gray-500">{allStats.length} matches</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-2 mt-auto" />
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto max-w-5xl">
          {loading ? (
            <div className="text-gray-400 text-center py-16">Loading...</div>
          ) : activeTab === "home" ? (
            <HomeTab allStats={allStats} />
          ) : activeTab === "analysis" ? (
            <AnalysisTab averages={averages} />
          ) : activeTab === "training" ? (
            <TrainingTab />
          ) : activeTab === "seasons" ? (
            <SeasonsTab seasons={seasons} userId={user.id} onDelete={handleDeleteSeasons} />
          ) : activeTab === "compare" ? (
            <CompareTab averages={averages} seasons={seasons} />
          ) : null}
        </main>
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

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-red-800/50">
            <h2 className="text-red-400 font-bold text-xl mb-2">Delete Account</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently delete your account, stats, and seasons.
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
    </div>
  );
}
