"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { addToQueue } from "../lib/sync";

function getRatingColor(rating: number): string {
  if (rating < 6) return '#DC0C00';
  if (rating < 6.5) return '#ED7E07';
  if (rating < 7) return '#E4CE6F';
  if (rating < 8) return '#00C424';
  if (rating < 9) return '#00ADC4';
  return '#374DF5';
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;
    setUserId(user.id);
    loadSeasons(user.id);
  }, []);

  const loadSeasons = async (uid: string) => {
    setLoading(true);

    // Load from Supabase
    const { data, error } = await supabase
      .from("past_seasons")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fall back to localStorage
      const past = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
      const local = past
        .filter((s: any) => s.userId === uid)
        .map((s: any) => ({
          ...s,
          id: s.id || Math.random().toString(36).substring(2) + Date.now().toString(36),
          // normalize field names from localStorage format
          season_name: s.season_name || s.seasonName,
          created_at: s.created_at || s.createdAt,
        }));
      setSeasons(local);
      setLoading(false);
      return;
    }

    setSeasons(data);
    setLoading(false);
  };

  const toggleSelectSeason = (id: string) => {
    if (!deleteMode) return;
    setSelectedSeasons(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteButton = () => {
    if (!deleteMode) { setDeleteMode(true); setSelectedSeasons([]); }
    else if (selectedSeasons.length > 0) setConfirmModal(true);
  };

const confirmDelete = async () => {
  // Delete from Supabase
  const { error } = await supabase
    .from("past_seasons")
    .delete()
    .in("id", selectedSeasons);

  if (error) {
    addToQueue({ type: "deleteMany", table: "past_seasons", column: "id", values: selectedSeasons });
  }

  // Also remove from localStorage
  const allSeasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
  localStorage.setItem("pastSeasons", JSON.stringify(
    allSeasons.filter((s: any) =>
  (s.userId !== userId && s.user_id !== userId) || !selectedSeasons.includes(s.id)
)
  ));

  setSeasons(prev => prev.filter(s => !selectedSeasons.includes(s.id)));
  setSelectedSeasons([]);
  setDeleteMode(false);
  setConfirmModal(false);
};
  const cancelDelete = () => {
    setDeleteMode(false);
    setSelectedSeasons([]);
    setConfirmModal(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 font-mono">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-teal-400 mb-6">Past Seasons</h1>

        {loading ? (
          <p className="text-gray-400 text-lg">Loading seasons...</p>
        ) : seasons.length === 0 ? (
          <p className="text-gray-400 text-lg sm:text-xl">No past seasons saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-32">
            {seasons.map((season) => (
              <div
                key={season.id}
                onClick={() => toggleSelectSeason(season.id)}
                className={`cursor-pointer bg-gray-900 border rounded-xl p-4 sm:p-5 shadow-lg transition-all
                  ${selectedSeasons.includes(season.id)
                    ? "border-red-500 shadow-red-500/50 scale-105"
                    : deleteMode ? "border-teal-400 hover:shadow-teal-500/20" : "border-teal-600"}`}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-teal-300">
                  {season.season_name || season.seasonName}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mt-1">
                  Saved: {new Date(season.created_at || season.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-4">
                  <p className="text-gray-300 font-semibold mb-1 text-xl sm:text-3xl">Averages:</p>
                  <ul className="text-gray-400 space-y-1">
                    {Object.entries(season.averages || {}).map(([position, data]: [string, any]) => (
                      <li key={position} className="flex justify-between text-base sm:text-xl">
                        <span className="capitalize">{position.replace(/_/g, " ")}:</span>
                        <span className="font-semibold" style={{ color: getRatingColor(data.rating) }}>
                          {data.rating}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Home Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-teal-500/50 backdrop-blur-sm z-40">
          <div className="max-w-md mx-auto text-center">
            <button onClick={() => router.push("/profile")}
              className="w-full sm:w-70 bg-teal-500 text-gray-900 font-extrabold text-lg sm:text-xl py-3 rounded-xl shadow-lg hover:bg-teal-400 transition-colors duration-200 uppercase tracking-widest">
              Go To Home Page
            </button>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center z-50">
        <button
          onClick={handleDeleteButton}
          disabled={deleteMode && selectedSeasons.length === 0}
          className={`bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors text-sm sm:text-base
            ${deleteMode && selectedSeasons.length === 0 ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {deleteMode
            ? selectedSeasons.length > 0 ? "Confirm Delete" : "Select Seasons to Delete"
            : "Remove Season(s)"}
        </button>
        {deleteMode && (
          <button onClick={cancelDelete}
            className="ml-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors text-sm sm:text-base">
            Cancel
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
          <div className="bg-gray-900 p-6 sm:p-8 rounded-xl shadow-xl flex flex-col items-center gap-4 w-full max-w-sm">
            <p className="text-white text-base sm:text-lg font-mono font-bold text-center">
              Are you sure you want to delete the selected season(s)?
            </p>
            <div className="flex gap-4">
              <button onClick={confirmDelete}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900 py-1 px-4 rounded-lg font-bold transition-colors">Yes</button>
              <button onClick={() => setConfirmModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded-lg font-bold transition-colors">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}