"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { addToQueue } from "../../lib/sync";

function getRatingColor(rating: number): string {
  if (rating < 6) return "#DC0C00";
  if (rating < 6.5) return "#ED7E07";
  if (rating < 7) return "#E4CE6F";
  if (rating < 8) return "#00C424";
  if (rating < 9) return "#00ADC4";
  return "#374DF5";
}

export default function SeasonsTab({
  seasons,
  userId,
  onDelete,
}: {
  seasons: any[];
  userId: string;
  onDelete: (ids: string[]) => void;
}) {
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const toggleSelectSeason = (id: string) => {
    if (!deleteMode) return;
    setSelectedSeasons((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteButton = () => {
    if (!deleteMode) {
      setDeleteMode(true);
      setSelectedSeasons([]);
    } else if (selectedSeasons.length > 0) {
      setConfirmModal(true);
    }
  };

  const confirmDelete = async () => {
    const { error } = await supabase.from("past_seasons").delete().in("id", selectedSeasons);
    if (error) {
      addToQueue({ type: "deleteMany", table: "past_seasons", column: "id", values: selectedSeasons });
    }

    const allSeasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
    localStorage.setItem(
      "pastSeasons",
      JSON.stringify(
        allSeasons.filter(
          (s: any) =>
            (s.userId !== userId && s.user_id !== userId) || !selectedSeasons.includes(s.id)
        )
      )
    );

    onDelete(selectedSeasons);
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
    <div className="space-y-4">
      {seasons.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No past seasons saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              onClick={() => toggleSelectSeason(season.id)}
              className={`cursor-pointer bg-gray-800/50 border rounded-xl p-4 shadow-lg transition-all ${
                selectedSeasons.includes(season.id)
                  ? "border-red-500 shadow-red-500/50 scale-105"
                  : deleteMode
                  ? "border-teal-400 hover:shadow-teal-500/20"
                  : "border-gray-700"
              }`}
            >
              <h2 className="text-xl font-bold text-teal-300">
                {season.season_name || season.seasonName}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Saved: {new Date(season.created_at || season.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <p className="text-gray-300 font-semibold mb-1">Averages:</p>
                <ul className="text-gray-400 space-y-1">
                  {Object.entries(season.averages || {}).map(([position, data]: [string, any]) => (
                    <li key={position} className="flex justify-between text-sm">
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

      {seasons.length > 0 && (
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleDeleteButton}
            disabled={deleteMode && selectedSeasons.length === 0}
            className={`font-bold py-2 px-5 rounded-lg transition-colors text-sm ${
              deleteMode
                ? selectedSeasons.length > 0
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {deleteMode
              ? selectedSeasons.length > 0
                ? "Delete Selected"
                : "Select Seasons to Delete"
              : "Delete Seasons"}
          </button>
          {deleteMode && (
            <button
              onClick={cancelDelete}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center gap-4 w-full max-w-sm">
            <p className="text-white text-base font-bold text-center">
              Are you sure you want to delete the selected season(s)?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900 py-2 px-4 rounded-lg font-bold transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-bold transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
