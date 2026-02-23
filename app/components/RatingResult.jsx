"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';


// Position-specific points for calculating ratings
const positionPoints = {
  striker: {
    goals: 125, shot_creation: 7, dribbles: 12, assists: 50,
  errors_chance: -13, mistakes: -7, penalties_missed: -70, passes_missed_ah: -3, passes_missed_oh: -3,
  penalties_committed: -50, big_chances_missed: -23, penalties_won: 40, off_target_shots: -4,
  unsuccessful_touches: -7, penalties: 70, tackles: 5, interceptions: 4,
  clearances: 2, blocks: 3, goal_line_clearances: 16, dribbled_past: -2,
  recoveries: 1, duels_lost: -3, duels_won: 5, fouls_committed: -6,
  yellow_cards: -13, red_card: -30, fouls_won: 8, big_chances_made: 23,
  key_passes: 12, passes_own_half: 1, crosses: 8, crosses_missed: -7,
  passes_opp_half: 1, possession_lost: -1, longBallsAccurate: 4, longBallMissed: -3,
  },
  left_winger: {
    goals: 125, shot_creation: 6, dribbles: 15, assists: 50,
  errors_chance: -16, mistakes: -7, penalties_missed: -70, passes_missed_ah: -2, passes_missed_oh: -4,
  penalties_committed: -50, big_chances_missed: -20, penalties_won: 40, off_target_shots: -4,
  unsuccessful_touches: -7, penalties: 70, tackles: 7, interceptions: 5,
  clearances: 4, blocks: 5, goal_line_clearances: 16, dribbled_past: -6,
  recoveries: 2, duels_lost: -3, duels_won: 6, fouls_committed: -6,
  yellow_cards: -13, red_card: -30, fouls_won: 7, big_chances_made: 24,
  key_passes: 14, passes_own_half: 1, crosses: 9, crosses_missed: -6,
  passes_opp_half: 1, possession_lost: -2, longBallsAccurate: 4, longBallMissed: -3,
  },
  right_winger: {
    goals: 125, shot_creation: 6, dribbles: 15, assists: 50,
  errors_chance: -16, mistakes: -7, penalties_missed: -70, passes_missed_ah: -2, passes_missed_oh: -4,
  penalties_committed: -50, big_chances_missed: -20, penalties_won: 40, off_target_shots: -4,
  unsuccessful_touches: -7, penalties: 70, tackles: 7, interceptions: 5,
  clearances: 4, blocks: 5, goal_line_clearances: 16, dribbled_past: -6,
  recoveries: 2, duels_lost: -3, duels_won: 6, fouls_committed: -6,
  yellow_cards: -13, red_card: -30, fouls_won: 7, big_chances_made: 24,
  key_passes: 14, passes_own_half: 1, crosses: 9, crosses_missed: -6,
  passes_opp_half: 1, possession_lost: -2, longBallsAccurate: 4, longBallMissed: -3,
  },
  attacking_mid: {
    goals: 125, shot_creation: 5, dribbles: 12, assists: 50,
  errors_chance: -25, mistakes: -8, penalties_missed: -70, passes_missed_ah: -2, passes_missed_oh: -4,
  penalties_committed: -50, big_chances_missed: -18, penalties_won: 40, off_target_shots: -3,
  unsuccessful_touches: -7, penalties: 70, tackles: 7, interceptions: 5,
  clearances: 4, blocks: 5, goal_line_clearances: 17, dribbled_past: -6,
  recoveries: 2, duels_lost: -5, duels_won: 7, fouls_committed: -8,
  yellow_cards: -13, red_card: -30, fouls_won: 6, big_chances_made: 25,
  key_passes: 17, passes_own_half: 1, crosses: 9, crosses_missed: -7,
  passes_opp_half: 1, possession_lost: -3, longBallsAccurate: 4, longBallMissed: -3
  },
  central_mid: {
    goals: 125, shot_creation: 5, dribbles: 12, assists: 50,
  errors_chance: -25, mistakes: -9, penalties_missed: -70, passes_missed_ah: -3, passes_missed_oh: -4,
  penalties_committed: -50, big_chances_missed: -18, penalties_won: 40, off_target_shots: -3,
  unsuccessful_touches: -7, penalties: 70, tackles: 8, interceptions: 7,
  clearances: 5, blocks: 10, goal_line_clearances: 18, dribbled_past: -8,
  recoveries: 1, duels_lost: -5, duels_won: 7, fouls_committed: -8,
  yellow_cards: -13, red_card: -30, fouls_won: 6, big_chances_made: 25,
  key_passes: 15, passes_own_half: 1, crosses: 8, crosses_missed: -7,
  passes_opp_half: 2, possession_lost: -3, longBallsAccurate: 5, longBallMissed: -3
  },
  defensive_mid: {
    goals: 125, shot_creation: 5, dribbles: 11, assists: 50,
  errors_chance: -25, mistakes: -10, penalties_missed: -70, passes_missed_ah: -2, passes_missed_oh: -5,
  penalties_committed: -50, big_chances_missed: -18, penalties_won: 40, off_target_shots: -2,
  unsuccessful_touches: -3, penalties: 70, tackles: 10, interceptions: 8,
  clearances: 7, blocks: 14, goal_line_clearances: 21, dribbled_past: -9,
  recoveries: 1, duels_lost: -6, duels_won: 8, fouls_committed: -10,
  yellow_cards: -13, red_card: -30, fouls_won: 6, big_chances_made: 25,
  key_passes: 15, passes_own_half: 1, crosses: 8, crosses_missed: -8,
  passes_opp_half: 2, possession_lost: -3, longBallsAccurate: 7, longBallMissed: -3
  },
  left_back: {
    goals: 125, shot_creation: 5, dribbles: 13, assists: 50, goals_conceded: -5,
  errors_chance: -22, mistakes: -9, penalties_missed: -70, passes_missed_ah: -4, passes_missed_oh: -5,
  penalties_committed: -50, big_chances_missed: -15, penalties_won: 50, off_target_shots: -3,
  unsuccessful_touches: -4, penalties: 70, tackles: 11, interceptions: 8,
  clearances: 7, blocks: 14, goal_line_clearances: 21, dribbled_past: -10,
  recoveries: 1, duels_lost: -4, duels_won: 6, fouls_committed: -9,
  yellow_cards: -13, red_card: -30, fouls_won: 8, big_chances_made: 22,
  key_passes: 13, passes_own_half: 1, crosses: 10, crosses_missed: -6,
  passes_opp_half: 2, possession_lost: -3, longBallsAccurate: 6, longBallMissed: -4
  },
  right_back: {
    goals: 125, shot_creation: 5, dribbles: 13, assists: 50, goals_conceded: -5,
  errors_chance: -22, mistakes: -9, penalties_missed: -70, passes_missed_ah: -4, passes_missed_oh: -5,
  penalties_committed: -50, big_chances_missed: -15, penalties_won: 50, off_target_shots: -3,
  unsuccessful_touches: -4, penalties: 70, tackles: 11, interceptions: 8,
  clearances: 7, blocks: 14, goal_line_clearances: 21, dribbled_past: -10,
  recoveries: 1, duels_lost: -4, duels_won: 6, fouls_committed: -9,
  yellow_cards: -13, red_card: -30, fouls_won: 8, big_chances_made: 22,
  key_passes: 13, passes_own_half: 1, crosses: 10, crosses_missed: -6,
  passes_opp_half: 2, possession_lost: -3, longBallsAccurate: 6, longBallMissed: -4
  },
  left_center_back: {
    goals: 125, shot_creation: 5, dribbles: 8, assists: 50, goals_conceded: -16,
  errors_chance: -28, mistakes: -11, penalties_missed: -70, passes_missed_ah: -5, passes_missed_oh: -7,
  penalties_committed: -50, big_chances_missed: -10, penalties_won: 50, off_target_shots: -3,
  unsuccessful_touches: -6, penalties: 70, tackles: 13, interceptions: 9,
  clearances: 8, blocks: 17, goal_line_clearances: 24, dribbled_past: -12,
  recoveries: 1, duels_lost: -7, duels_won: 8, fouls_committed: -11,
  yellow_cards: -13, red_card: -30, fouls_won: 6, big_chances_made: 20,
  key_passes: 11, passes_own_half: 1, crosses: 8, crosses_missed: -8,
  passes_opp_half: 2, possession_lost: -4, longBallsAccurate: 6, longBallMissed: -3
  },
  right_center_back: {
    goals: 125, shot_creation: 5, dribbles: 8, assists: 50, goals_conceded: -16,
  errors_chance: -28, mistakes: -11, penalties_missed: -70, passes_missed_ah: -5, passes_missed_oh: -7,
  penalties_committed: -50, big_chances_missed: -10, penalties_won: 50, off_target_shots: -3,
  unsuccessful_touches: -6, penalties: 70, tackles: 13, interceptions: 9,
  clearances: 8, blocks: 17, goal_line_clearances: 24, dribbled_past: -12,
  recoveries: 1, duels_lost: -7, duels_won: 8, fouls_committed: -11,
  yellow_cards: -13, red_card: -30, fouls_won: 6, big_chances_made: 20,
  key_passes: 11, passes_own_half: 1, crosses: 8, crosses_missed: -8,
  passes_opp_half: 2, possession_lost: -4, longBallsAccurate: 6, longBallMissed: -3
},
  goalkeeper: {
  // Outfield stats
  goals: 125, shot_creation: 3, dribbles: 5, assists: 50,
  errors_chance: -30, mistakes: -13, penalties_missed: -70, passes_missed_ah: -2, passes_missed_oh: -4,
  penalties_committed: -50, big_chances_missed: -16, penalties_won: 50, off_target_shots: -3,
  unsuccessful_touches: -8, penalties: 70, tackles: 9, interceptions: 6,
  clearances: 1, blocks: 8, goal_line_clearances: 30, dribbled_past: -10,
  recoveries: 0.5, duels_lost: -7, duels_won: 3, fouls_committed: -15,
  yellow_cards: -8, red_card: -20, fouls_won: 8, big_chances_made: 25,
  key_passes: 13, passes_own_half: 1, crosses: 10,
  passes_opp_half: 5, possession_lost: -1, longBallsAccurate: 5, longBallMissed: -2,

  // GK stats
  cleanSheet: 10, goalsConceded: -25, totalSaves: 8, savesInBox: 20,
  punches: 2, runsOut: 5, unsucessfullRunsOut: 12, highClaims: 4,
  gkErrorShot: -13, gkErrorGoal: -30, penaltySaved: 60, penaltyConceded: -18,
},
  divisor: 124
};


function calculateRating(position, stats) {
  const points = positionPoints[position.id]; 
  const divisor = positionPoints.divisor; // common divisor 124

  let totalPoints = 0;

  Object.keys(stats).forEach(statKey => {
    const pointValue = points[statKey] || 0;
    totalPoints += stats[statKey] * pointValue;
  });

  // Base starting rating
  const rating = 6.5 + (totalPoints / divisor);

  // Keep rating between 3 and 10
  return Math.min(10, Math.max(3, rating));
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

function getTopStats(stats) {
  const positive = [];
  const negative = [];
  
  const statLabels = {
    goals: 'Goals', shot_creation: 'Shot Creation', dribbles: 'Dribbles',
    assists: 'Assists', valuable_dribbles: 'Valuable Dribbles', penalties: 'Tap-ins',
    penalties_won: 'Penalties Won', tackles: 'Tackles', interceptions: 'Interceptions',
    clearances: 'Clearances', blocks: 'Blocks', recoveries: 'Recoveries',
    duels_won: 'Duels Won', fouls_won: 'Fouls Won', big_chances_made: 'Big Chances Made',
    key_passes: 'Key Passes', passes_opp_half: 'Passes (Opp. Half)', crosses: 'Crosses',
    errors_chance: 'Errors Leading to Chance', mistakes: 'Mistakes',
    big_chances_missed: 'Big Chances Missed', off_target_shots: 'Off Target Shots',
    unsuccessful_touches: 'Unsuccessful Touches', dribbled_past: 'Dribbled Past',
    duels_lost: 'Duels Lost', fouls_committed: 'Fouls Committed',
    yellow_cards: 'Yellow Cards', red_card: 'Red Cards', passes_missed: 'Passes Missed',
    possession_lost: 'Possession Lost', passes_own_half: 'Passes (Own Half)',
    goal_line_clearances: 'Goal-Line Clearances'
  };
  
  const positiveStats = ['goals', 'assists', 'tackles', 'interceptions', 'key_passes', 'big_chances_made', 'duels_won', 'recoveries', 'clearances', 'blocks'];
  const negativeStats = ['errors_chance', 'mistakes', 'big_chances_missed', 'yellow_cards', 'red_card', 'duels_lost'];
  
  positiveStats.forEach(key => {
    if (stats[key] > 0) {
      positive.push({ label: statLabels[key], value: stats[key] });
    }
  });
  
  negativeStats.forEach(key => {
    if (stats[key] > 0) {
      negative.push({ label: statLabels[key], value: stats[key] });
    }
  });
  
  return { positive: positive.slice(0, 3), negative: negative.slice(0, 3) };
}

export default function RatingResult({ position, stats, onReset, user }) {
  const [displayRating, setDisplayRating] = useState(6.5);
  const rating = calculateRating(position, stats);
  const { positive, negative } = getTopStats(stats);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 6.5;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayRating(startValue + (rating - startValue) * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [rating]);

  // Save rating to localStorage
  useEffect(() => {
  if (!user || !position) return;

  const saved = JSON.parse(localStorage.getItem("playerStats") || "{}");
  const userStats = saved[user.id] || {};

  const posKey = position.id || position.name.toLowerCase().replace(" ", "_");

  let posArray = userStats[posKey];
  if (!Array.isArray(posArray)) posArray = []; // FIX: ensure it's an array

  const entry = {
    rating,
    positive: positive || [],
    negative: negative || [],
    timestamp: Date.now(),
  };

  posArray.push(entry);

  const updated = { ...saved, [user.id]: { ...userStats, [posKey]: posArray } };
  localStorage.setItem("playerStats", JSON.stringify(updated));
}, [user, position]); // only once per user & position



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center">
      <PlayerBadge user={user} rating={rating} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Position badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-slate-300 text-sm font-medium">
            <Trophy className="w-4 h-4 text-amber-500" />
            {position.name}
          </span>
        </motion.div>

        <div className="flex flex-col items-center mt-10 gap-4">

  {/* Big Profile Circle */}
  <div 
  className="w-48 h-48 rounded-full overflow-hidden border-5 shadow-xl"
  style={{ borderColor: getRatingColor(displayRating) }}>
    <img
      src={user?.image || "/default.png"}
      className="w-full h-full object-cover"
      alt="Profile"
    />
  </div>

  {/* Rating Badge */}
  <div className="text-white px-6 py-2 rounded-xl text-2xl font-bold shadow-md -top-3"
  style={{ backgroundColor: getRatingColor(displayRating) }}>
    {displayRating.toFixed(1)}
  </div>

  {/* Player Name */}
  <p className="text-white text-xl font-semibold tracking-wide relative -top-2.5">
    {user?.name || "Player"}
  </p>

</div>

        {/* Stats breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-8"
        >
          {positive.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
                <TrendingUp className="w-4 h-4" />
                Key Contributions
              </div>
              <div className="space-y-2">
                {positive.map((stat, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-300">{stat.label}</span>
                    <span className="text-emerald-400 font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {negative.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-3">
                <TrendingDown className="w-4 h-4" />
                Areas to Improve
              </div>
              <div className="space-y-2">
                {negative.map((stat, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-300">{stat.label}</span>
                    <span className="text-red-400 font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {positive.length === 0 && negative.length === 0 && (
            <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                <Minus className="w-4 h-4" />
                Neutral Performance
              </div>
            </div>
          )}
        </motion.div>

        {/* Reset button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onReset}
            className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-lg font-semibold"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Calculate Another Rating
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
function PlayerBadge({ user, rating }) {
}
