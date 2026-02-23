"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false); // <-- new: confirmation modal
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    setUserId(user.id);

    const past = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
    const pastWithIds = past.map(s => ({
      ...s,
      id: s.id || crypto.randomUUID()
    }));
    localStorage.setItem("pastSeasons", JSON.stringify(pastWithIds));

    setSeasons(pastWithIds.filter(s => s.userId === user.id));
  }, []);

  const toggleSelectSeason = (id) => {
    if (!deleteMode) return; // only selectable in delete mode
    setSelectedSeasons(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteButton = () => {
    if (!deleteMode) {
      setDeleteMode(true);
      setSelectedSeasons([]);
    } else if (selectedSeasons.length > 0) {
      // show confirmation modal
      setConfirmModal(true);
    }
  };

  const confirmDelete = () => {
    const updatedSeasons = seasons.filter(season => !selectedSeasons.includes(season.id));
    setSeasons(updatedSeasons);

    const allSeasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
    const newSeasons = allSeasons.filter(
      s => s.userId !== userId || !selectedSeasons.includes(s.id)
    );
    localStorage.setItem("pastSeasons", JSON.stringify(newSeasons));

    setSelectedSeasons([]);
    setDeleteMode(false);
    setConfirmModal(false);
  };

  const cancelDelete = () => {
    setDeleteMode(false);
    setSelectedSeasons([]);
    setConfirmModal(false);
  };

  const closeModal = () => setConfirmModal(false);

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white p-6 font-mono">
        <h1 className="text-6xl font-extrabold text-teal-400 mb-6">Past Seasons</h1>

        {seasons.length === 0 ? (
          <p className="text-gray-400 text-xl">No past seasons saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-32 pointer-events-auto">
            {seasons.map((season) => (
              <div
                key={season.id}
                onClick={() => toggleSelectSeason(season.id)}
                className={`cursor-pointer bg-gray-900 border rounded-xl p-5 shadow-lg transition-all
                  ${selectedSeasons.includes(season.id)
                    ? "border-red-500 shadow-red-500/50 scale-105"
                    : deleteMode
                      ? "border-teal-400 hover:shadow-teal-500/20"
                      : "border-teal-600"
                  }`}
              >
                <h2 className="text-3xl font-bold text-teal-300">{season.seasonName}</h2>
                <p className="text-gray-400 text-base mt-1">
                  Saved: {new Date(season.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-4">
                  <p className="text-gray-300 font-semibold mb-1 text-3xl">Averages:</p>
                  <ul className="text-gray-400 text-sm space-y-1">
                    {Object.entries(season.averages).map(([position, data]) => (
                      <li key={position} className="flex justify-between text-xl">
                        <span className="capitalize">{position.replace("_", " ")}:</span>
                        <span className="text-teal-400 font-semibold text-xl" style={{ color: getRatingColor(data.rating) }}>{data.rating}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HOME BUTTON */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-teal-500/50 backdrop-blur-sm z-40">
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={() => router.push("/")}
              className="w-70 bg-teal-500 text-gray-900 font-extrabold text-xl py-3 rounded-xl shadow-lg hover:bg-teal-400 transition-colors duration-200 uppercase tracking-widest"
            >
              Go To Home Page
            </button>
          </div>
        </div>
      </div>

      {/* REMOVE/CONFIRM BUTTON */}
      <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center z-50 pointer-events-auto">
        <button
          onClick={handleDeleteButton}
          className={`bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors
            ${deleteMode && selectedSeasons.length === 0 ? "opacity-70 cursor-not-allowed" : ""}
          `}
          disabled={deleteMode && selectedSeasons.length === 0}
        >
          {deleteMode
            ? selectedSeasons.length > 0
              ? "Confirm Delete"
              : "Select Seasons to Delete"
            : "Remove Season(s)"}
        </button>

        {deleteMode && (
          <button
            onClick={cancelDelete}
            className="ml-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
          <div className="bg-gray-900 p-8 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <p className="text-white text-lg font-mono font-bold">Are you sure you want to delete the selected season(s)?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900 py-1 px-4 rounded-lg font-bold font-mono transition-colors"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded-lg font-bold font-mono transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function getRatingColor(rating) {
  if (rating < 6) return '#DC0C00';
  if (rating < 6.5) return '#ED7E07';
  if (rating < 7) return '#E4CE6F';
  if (rating < 8) return '#00C424';
  if (rating < 9) return '#00ADC4';
  if (rating < 10) return '#374DF5';
  if (rating = 10) return '#374DF5';
}