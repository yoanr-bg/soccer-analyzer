"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const positions = [
  "striker",
  "left_winger",
  "right_winger",
  "attacking_mid",
  "central_mid",
  "defensive_mid",
  "left_back",
  "right_back",
  "left_center_back",
  "right_center_back",
  "goalkeeper",
];

export default function ProfilePage() {
  const router = useRouter();
  const [newSeasonModalOpen, setNewSeasonModalOpen] = useState(false);
const [seasonInput, setSeasonInput] = useState("");

  const stats = [
  { id: 'goals', name: 'Non-Penalty Goals', category: 'Shooting' },
  { id: 'shot_creation', name: 'Shots Taken', category: 'Shooting' },
  { id: 'big_chances_missed', name: 'Big Chances Missed', category: 'Shooting' },
  { id: 'off_target_shots', name: 'Shots Off Target', category: 'Shooting' },
  { id: 'penalties', name: 'Penalties Scored', category: 'Shooting' },
  { id: 'penalties_missed', name: 'Penalties Missed', category: 'Shooting' },
  { id: 'assists', name: 'Assists', category: 'Passing' },
  { id: 'big_chances_made', name: 'Big Chances Made', category: 'Passing' },
  { id: 'key_passes', name: 'Key Passes', category: 'Passing' },
  { id: 'passes_own_half', name: 'Passes in Own Half', category: 'Passing' },
  { id: 'passes_opp_half', name: 'Passes in Opposition Half', category: 'Passing' },
  { id: 'crosses', name: 'Successful Crosses', category: 'Passing' },
  { id: 'passes_missed', name: 'Passes Missed', category: 'Passing' },
  { id: 'dribbles', name: 'Dribbles', category: 'Dribbling' },
  { id: 'mistakes', name: 'Mistakes (Offsides, Unsuccessful Dribbles)', category: 'Dribbling' },
  { id: 'unsuccessful_touches', name: 'Unsuccessful Touches', category: 'Dribbling' },
  { id: 'penalties_won', name: 'Penalties Won', category: 'Dribbling' },
  { id: 'fouls_won', name: 'Fouls Won', category: 'Dribbling' },
  { id: 'possession_lost', name: 'Possession Lost', category: 'Dribbling' },
  { id: 'errors_chance', name: 'Errors Leading to Chance', category: 'Defending' },
  { id: 'tackles', name: 'Tackles', category: 'Defending' },
  { id: 'interceptions', name: 'Interceptions', category: 'Defending' },
  { id: 'clearances', name: 'Clearances', category: 'Defending' },
  { id: 'blocks', name: 'Blocked Shots', category: 'Defending' },
  { id: 'goal_line_clearances', name: 'Goal-Line Clearances', category: 'Defending' },
  { id: 'dribbled_past', name: 'Dribbled Past', category: 'Defending' },
  { id: 'recoveries', name: 'Recoveries', category: 'Defending' },
  { id: 'duels_won', name: 'Duels Won', category: 'Defending' },
  { id: 'duels_lost', name: 'Duels Lost', category: 'Defending' },
  { id: 'fouls_committed', name: 'Fouls Committed', category: 'Defending' },
  { id: 'yellow_cards', name: 'Yellow Cards', category : 'Miscellaneous'},
  { id: 'red_card', name: 'Red Card', category : 'Miscellaneous'},
];
  const [viewingStats, setViewingStats] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [averages, setAverages] = useState<any>({});
  const handleLogout = () => {
  localStorage.removeItem("user"); // Remove logged-in user
  router.push("/login");           // Navigate to login page
};

  // Load user and stats from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const u = JSON.parse(storedUser);
    setUser(u);

    const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
    const userStats = savedStats[u.id] || {};

    const avgRatings: any = {};

    positions.forEach((pos) => {
      const entries = userStats[pos] || [];
      if (entries.length > 0) {
        const sumRating = entries.reduce((total: number, e: any) => total + e.rating, 0);
        const avgRating = (sumRating / entries.length).toFixed(2);

        const sumPositive: any = {};
        const sumNegative: any = {};

        entries.forEach((e: any) => {
          e.positive?.forEach((stat: any) => {
            sumPositive[stat.label] = (sumPositive[stat.label] || 0) + stat.value;
          });
          e.negative?.forEach((stat: any) => {
            sumNegative[stat.label] = (sumNegative[stat.label] || 0) + stat.value;
          });
        });

        const avgPositive = Object.fromEntries(
          Object.entries(sumPositive).map(([k, v]) => [k, (v as number / entries.length).toFixed(1)])
        );

        const avgNegative = Object.fromEntries(
          Object.entries(sumNegative).map(([k, v]) => [k, (v as number / entries.length).toFixed(1)])
        );

        avgRatings[pos] = {
          rating: avgRating,
          positive: avgPositive,
          negative: avgNegative,
        };
      }
    });

    setAverages(avgRatings);
  }, []);

  const getFeedback = (rating: number) => {
    if (rating >= 8.5) return "Excellent — keep doing what you're doing!";
    if (rating >= 7) return "Decent performance — keep improving consistency.";
    if (rating >= 6.5) return "Average — work on the things you see below.";
    return "Weak — focus on the fundementals.";
  };

  if (!user) return <div className="text-white p-8 bg-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-900 p-6 text-white relative font-mono">
      {/* Top Bar */}
<div className="w-full bg-gray-800 px-8 py-6 rounded-lg mb-8 shadow-lg relative">
  {/* Left side: Title */}
  <h1 className="text-2xl font-bold text-teal-400">Player Profile</h1>
  
  {/* Right side: Logout button */}
  <button
    onClick={() => {
      localStorage.removeItem("user"); // Clear logged-in user
      router.push("/login");           // Redirect to login page
    }}
     className="absolute top-5 right-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
  >
    Logout
  </button>
  {/* Season Controls */}
<div className="absolute left-1/2 -translate-x-1/2 top-5 flex items-center gap-4">

  {/* New Season Button */}
  <button
  onClick={() => setNewSeasonModalOpen(true)}
  className="bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
>
  + New Season
</button>


  {/* View Past Seasons */}
  <button
      onClick={() => {
        const seasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]")
          .filter((s: any) => s.userId === user.id);

        if (seasons.length === 0) {
          alert("No past seasons saved yet.");
          return;
        }

        // Navigate to /seasons
        router.push("/seasons");
      }}
       className="bg-gray-800 hover:bg-gray-700 text-teal-400 border border-teal-500 py-2 px-4 rounded-lg transition-all shadow-md"
    >
      📂 Past Seasons
    </button>
{newSeasonModalOpen && (
  <div className="top-15 fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-96">
      <h2 className="text-teal-400 font-bold text-xl mb-4">Name Current Season</h2>
      <input
        type="text"
        value={seasonInput}
        onChange={(e) => setSeasonInput(e.target.value)}
        placeholder="e.g., Fall 2024"
        className="w-full bg-gray-900 border-2 border-gray-600 text-white py-2 px-3 rounded-lg focus:border-teal-400 outline-none placeholder-gray-500"
      />
      <div className="flex justify-end mt-4 gap-3">
        <button
          onClick={() => setNewSeasonModalOpen(false)}
          className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded-lg"
        >
          Cancel
        </button>
        <button
  onClick={() => {
    if (!seasonInput) return; // Don't proceed if empty

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser.id) return;

    const savedStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
    const userStats = savedStats[storedUser.id] || {};

    const pastSeasons = JSON.parse(localStorage.getItem("pastSeasons") || "[]");
    pastSeasons.push({
      userId: storedUser.id,
      seasonName: seasonInput,
      createdAt: new Date().toISOString(),
      averages,
      rawStats: userStats,
    });

    localStorage.setItem("pastSeasons", JSON.stringify(pastSeasons));
    savedStats[storedUser.id] = {};
    localStorage.setItem("playerStats", JSON.stringify(savedStats));

    alert(`Season saved! You can look at your past seasons when you click on the past seasons button!`);

    // Close modal and reset input instead of reload
    setNewSeasonModalOpen(false);
    setSeasonInput("");
  }}
  className="bg-teal-500 hover:bg-teal-400 text-gray-900 py-1 px-4 rounded-lg font-bold font-mono transition-colors"
>
  Save
</button>
      </div>
    </div>
  </div>
)}
</div>
</div>

      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-12 border-b border-gray-700 pb-6">
        <img
          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "?")}&background=0f766e&color=fff&size=128`}
          className="w-24 h-24 rounded-full object-cover border-4 border-teal-400 shadow-xl"
          alt={`${user.name}'s profile picture`}
        />
        <div>
          <h2 className="text-6xl font-extrabold text-white mb-1 mt-[25px]">{user.name}</h2>
        </div>
      </div>

      {/* Average Ratings Section */}
      <h2 className="text-3xl font-semibold mb-6 text-teal-400 border-b border-gray-700 pb-2">
        <span className="text-gray-600">// </span> Position Performance Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {positions
          .filter((pos) => averages[pos])
          .map((pos) => (
            <div
              key={pos}
              className="bg-gray-800 p-5 rounded-xl shadow-2xl border-2 border-gray-700 hover:border-teal-500 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="capitalize text-2xl font-bold text-white tracking-wider">
                  {pos.replace("_", " ")}
                </span>
                <span className="text-4xl font-extrabold text-teal-400 bg-gray-900 px-3 py-1 rounded-lg">
                  <span style={{ color: getRatingColor(averages[pos].rating) }}>{averages[pos].rating}</span>
                </span>
              </div>

              <p className="text-base text-gray-400 mb-4 border-t border-gray-700 pt-3">
                {getFeedback(Number(averages[pos].rating))}
              </p>

              {/* Positive Stats */}
              {Object.keys(averages[pos].positive).length > 0 && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-green-700/50">
                  <strong className="text-green-400 text-lg block mb-1">Top Positive Stats (per game):</strong>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {Object.entries(averages[pos].positive).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span className="text-green-500">{k}</span>
                        <span className="font-semibold text-green-400">+{v as string}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negative Stats */}
              {Object.keys(averages[pos].negative).length > 0 && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-red-700/50">
                  
                  <strong className="text-red-400 text-lg block mb-1">Top Negative Stats (per game):</strong>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
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
            <p className="text-base text-gray-600 mt-2">Submit a match rating to begin your analysis.</p>
          </div>
        )}
      </div>

      {/* Home Button (Fixed Position) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-teal-500/50 backdrop-blur-sm">
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
  );
}

function getRatingColor(rating: number) {
  if (rating < 6) return '#DC0C00';
  if (rating < 6.5) return '#ED7E07';
  if (rating < 7) return '#E4CE6F';
  if (rating < 8) return '#00C424';
  if (rating < 9) return '#00ADC4';
  if (rating < 10) return '#374DF5';
  if (rating = 10) return '#374DF5';
}