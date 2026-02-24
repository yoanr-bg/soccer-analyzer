"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Plus, Minus, LayoutList, Layers } from 'lucide-react';
import { useRouter } from "next/navigation";

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
  { id: 'crosses', name: 'Successful Crosses', category: 'Passing' },
  { id: 'crosses_missed', name: 'Missed Crosses', category: 'Passing' },
  { id: 'passes_own_half', name: 'Passes in Own Half', category: 'Passing' },
  { id: 'passes_missed_oh', name: 'Passes Missed in Own Half', category: 'Passing' },
  { id: 'passes_opp_half', name: 'Passes in Opposition Half', category: 'Passing' },
  { id: 'passes_missed_ah', name: 'Passes Missed in Opposition Half', category: 'Passing' },
  { id: 'longBallsAccurate', name: 'Accurate Long Balls', category: 'Passing' },
  { id: 'longBallMissed', name: 'Missed Long Balls', category: 'Passing' },
  { id: 'dribbles', name: 'Dribbles', category: 'Dribbling' },
  { id: 'mistakes', name: 'Mistakes (Offsides, Unsuccessful Dribbles)', category: 'Dribbling' },
  { id: 'unsuccessful_touches', name: 'Unsuccessful Touches', category: 'Dribbling' },
  { id: 'penalties_won', name: 'Penalties Won', category: 'Dribbling' },
  { id: 'fouls_won', name: 'Fouls Won', category: 'Dribbling' },
  { id: 'possession_lost', name: 'Possessions Lost', category: 'Dribbling' },
  { id: 'errors_chance', name: 'Errors Leading to Chance or Goal', category: 'Defending' },
  { id: 'tackles', name: 'Tackles', category: 'Defending' },
  { id: 'interceptions', name: 'Interceptions', category: 'Defending' },
  { id: 'clearances', name: 'Clearances', category: 'Defending' },
  { id: 'blocks', name: 'Blocked Shots', category: 'Defending' },
  { id: 'penalties_committed', name: 'Penalties Committed', category: 'Defending' },
  { id: 'goal_line_clearances', name: 'Goal-Line Clearances', category: 'Defending' },
  { id: 'dribbled_past', name: 'Dribbled Past', category: 'Defending' },
  { id: 'recoveries', name: 'Recoveries', category: 'Defending' },
  { id: 'duels_won', name: 'Duels Won', category: 'Defending' },
  { id: 'duels_lost', name: 'Duels Lost', category: 'Defending' },
  { id: 'fouls_committed', name: 'Fouls Committed', category: 'Defending' },
  { id: 'yellow_cards', name: 'Yellow Cards', category: 'Miscellaneous', max: 2 },
  { id: 'red_card', name: 'Red Card', category: 'Miscellaneous', max: 1 },
];

const goalkeeper_stats = [
  { id: 'cleanSheet', name: 'Clean Sheets', category: 'Goalkeeping', max: 1 },
  { id: 'goalsConceded', name: 'Goals Conceded', category: 'Goalkeeping' },
  { id: 'totalSaves', name: 'Total Saves', category: 'Goalkeeping' },
  { id: 'savesInBox', name: 'Saves Inside The Box', category: 'Goalkeeping' },
  { id: 'punches', name: 'Punches', category: 'Goalkeeping' },
  { id: 'runsOut', name: 'Successful Runs Out', category: 'Goalkeeping' },
  { id: 'unsucessfullRunsOut', name: 'Unsuccessful Runs Out', category: 'Goalkeeping' },
  { id: 'highClaims', name: 'High Claims', category: 'Goalkeeping' },
  { id: 'gkErrorShot', name: 'Errors Leading To Shot', category: 'Goalkeeping' },
  { id: 'gkErrorGoal', name: 'Errors Leading To Goals', category: 'Goalkeeping' },
  { id: 'penaltySaved', name: 'Penalties Saved', category: 'Goalkeeping' },
  { id: 'penaltyConceded', name: 'Penalties Conceded', category: 'Goalkeeping' },
];

// Extra stat shown only for defensive outfield positions
const defensive_position_stats = [
  { id: 'goals_conceded', name: 'Goals Conceded', category: 'Defending' },
];

const DEFENSIVE_POSITIONS = ['left_center_back', 'right_center_back', 'left_back', 'right_back'];

const categoryColors = {
  'Shooting':      'from-red-600 to-red-800',
  'Passing':       'from-blue-600 to-blue-800',
  'Dribbling':     'from-purple-600 to-purple-800',
  'Defending':     'from-teal-600 to-teal-800',
  'Miscellaneous': 'from-amber-500 to-orange-700',
  'Goalkeeping':   'from-green-600 to-emerald-800',
};

const categoryBorder = {
  'Shooting':      'border-red-800',
  'Passing':       'border-blue-800',
  'Dribbling':     'border-purple-800',
  'Defending':     'border-teal-800',
  'Miscellaneous': 'border-amber-700',
  'Goalkeeping':   'border-green-800',
};

const categoryAccent = {
  'Shooting': {
    text: 'text-red-400',
    plusBtn: 'bg-red-600 hover:bg-red-500 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-red-400 border border-red-900',
  },
  'Passing': {
    text: 'text-blue-400',
    plusBtn: 'bg-blue-600 hover:bg-blue-500 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-blue-400 border border-blue-900',
  },
  'Dribbling': {
    text: 'text-purple-400',
    plusBtn: 'bg-purple-600 hover:bg-purple-500 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-purple-400 border border-purple-900',
  },
  'Defending': {
    text: 'text-teal-400',
    plusBtn: 'bg-teal-600 hover:bg-teal-500 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-teal-400 border border-teal-900',
  },
  'Miscellaneous': {
    text: 'text-amber-400',
    plusBtn: 'bg-amber-500 hover:bg-amber-400 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-amber-400 border border-amber-900',
  },
  'Goalkeeping': {
    text: 'text-green-400',
    plusBtn: 'bg-green-600 hover:bg-green-500 active:scale-95',
    minusBtn: 'bg-gray-700 hover:bg-gray-600 active:scale-95 text-green-400 border border-green-900',
  },
};

const categoryOrder = ['Shooting', 'Passing', 'Dribbling', 'Defending', 'Miscellaneous'];
const gkCategoryOrder = ['Goalkeeping'];

const outfieldGroupedStats = categoryOrder.map(cat => ({
  category: cat,
  stats: stats.filter(s => s.category === cat),
}));

const goalkeeperGroupedStats = gkCategoryOrder.map(cat => ({
  category: cat,
  stats: goalkeeper_stats.filter(s => s.category === cat),
}));

function useColumnCount() {
  const [cols, setCols] = useState(1);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1600) setCols(5);
      else if (w >= 1200) setCols(4);
      else if (w >= 900) setCols(3);
      else if (w >= 640) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

function StatRow({ stat, value, onBump, accent }) {
  const maxValue = stat.max !== undefined ? stat.max : Infinity;
  const atMin = value <= 0;
  const atMax = value >= maxValue;

  return (
    <div className="flex items-center bg-gray-800/80 rounded-2xl border border-gray-700 px-4 py-3 gap-3">
      <span className="flex-1 text-white text-lg font-semibold tracking-wide leading-snug">
        {stat.name}
      </span>

      <button
        onClick={() => !atMin && onBump(stat.id, -1)}
        disabled={atMin}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-100 select-none flex-shrink-0
          ${atMin
            ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed opacity-40'
            : `${accent.minusBtn} cursor-pointer`
          }`}
      >
        <Minus className="w-4 h-4" />
      </button>

      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ scale: 1.5, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={`w-10 text-center text-2xl font-extrabold tabular-nums flex-shrink-0 ${value === 0 ? 'text-gray-600' : accent.text}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>

      <button
        onClick={() => !atMax && onBump(stat.id, 1)}
        disabled={atMax}
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-all duration-100 select-none flex-shrink-0
          ${atMax
            ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed opacity-40'
            : `${accent.plusBtn} cursor-pointer`
          }`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

function CategoryColumn({ group, getValue, bump }) {
  const accent = categoryAccent[group.category];
  return (
    <div className={`flex flex-col rounded-2xl border-2 ${categoryBorder[group.category]} overflow-hidden w-full`}>
      <div className={`bg-gradient-to-r ${categoryColors[group.category]} px-4 py-3 flex-shrink-0`}>
        <span className="text-white text-xl font-extrabold uppercase tracking-widest">
          {group.category}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-2 bg-gray-900">
        {group.stats.map(stat => (
          <StatRow
            key={stat.id}
            stat={stat}
            value={getValue(stat.id)}
            onBump={bump}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}

export default function StatInput({ position, onComplete, onPrev, initialValues = {} }) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [values, setValues] = useState(initialValues ?? {});
  const [showAll, setShowAll] = useState(false);
  const cols = useColumnCount();

  const positionId = typeof position === 'object'
    ? position?.id
    : String(position ?? '').toLowerCase();
  const isGK = positionId === 'goalkeeper';
  const isDefensivePosition = DEFENSIVE_POSITIONS.includes(positionId);

  // Build grouped stats: inject Goals Conceded into Defending for defensive outfield positions
  const groupedStats = (() => {
    if (isGK) return [...goalkeeperGroupedStats, ...outfieldGroupedStats];

    if (isDefensivePosition) {
      return outfieldGroupedStats.map(group => {
        if (group.category === 'Defending') {
          return {
            ...group,
            stats: [...defensive_position_stats, ...group.stats],
          };
        }
        return group;
      });
    }

    return outfieldGroupedStats;
  })();

  const currentGroup = groupedStats[categoryIndex];
  const totalCategories = groupedStats.length;
  const progress = (categoryIndex / totalCategories) * 100;

  const getValue = (id) => values[id] ?? 0;

  const bump = (id, delta) => {
    setValues(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  };

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) setCategoryIndex(categoryIndex + 1);
    else onComplete({ ...values });
  };

  const handlePrev = () => {
    if (categoryIndex > 0) setCategoryIndex(categoryIndex - 1);
    else onPrev();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col font-mono">

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: showAll ? '100%' : `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <button
          onClick={() => setShowAll(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border-2 transition-all duration-200 select-none whitespace-nowrap
            ${showAll
              ? 'bg-teal-500 border-teal-400 text-gray-900'
              : 'bg-gray-800 border-gray-700 text-teal-400 hover:border-teal-600'
            }`}
        >
          {showAll ? <LayoutList className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          {showAll ? 'One at a time' : 'Show all'}
        </button>
      </div>

      {/* Step dots — single-category mode only */}
      {!showAll && (
        <div className="flex justify-center gap-2 mb-8">
          {groupedStats.map((g, i) => (
            <div
              key={g.category}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === categoryIndex ? 'w-8 bg-teal-400' : i < categoryIndex ? 'w-4 bg-teal-700' : 'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── SINGLE CATEGORY VIEW ── */}
      {!showAll && (
        <div className="flex-1 flex flex-col items-center max-w-xl mx-auto w-full pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <div className={`inline-flex px-5 py-2 rounded-full bg-gradient-to-r ${categoryColors[currentGroup.category]} text-white text-sm font-bold mb-3 shadow-lg uppercase tracking-wider`}>
                  {currentGroup.category}
                </div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">
                  {categoryIndex + 1} / {totalCategories}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {currentGroup.stats.map((stat, i) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <StatRow
                      stat={stat}
                      value={getValue(stat.id)}
                      onBump={bump}
                      accent={categoryAccent[currentGroup.category]}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  onClick={handlePrev}
                  className="h-14 px-6 bg-gray-800 border-2 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white rounded-xl transition-colors font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {categoryIndex === 0 ? 'Back' : 'Previous'}
                </Button>
                <Button
                  onClick={handleNext}
                  className={`h-14 px-8 rounded-xl text-lg font-extrabold shadow-lg transition-all duration-200 uppercase tracking-widest ${
                    categoryIndex === totalCategories - 1
                      ? 'bg-gradient-to-r from-teal-500 to-green-500 text-gray-900 hover:from-teal-600 hover:to-green-600'
                      : 'bg-gray-700 border-2 border-teal-500 text-white hover:bg-gray-600 hover:border-teal-400'
                  }`}
                >
                  {categoryIndex === totalCategories - 1 ? (
                    <><Check className="w-5 h-5 mr-2" />Complete Analysis</>
                  ) : (
                    <>Next Category<ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── ALL CATEGORIES VIEW ── */}
      {showAll && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 pb-28 w-full"
        >
          <div
            className="w-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: '1rem',
              alignItems: 'start',
            }}
          >
            {groupedStats.map(group => (
              <CategoryColumn
                key={group.category}
                group={group}
                getValue={getValue}
                bump={bump}
              />
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={() => onComplete({ ...values })}
              className="h-14 px-10 rounded-xl text-lg font-extrabold shadow-lg uppercase tracking-widest bg-gradient-to-r from-teal-500 to-green-500 text-gray-900 hover:from-teal-600 hover:to-green-600"
            >
              <Check className="w-5 h-5 mr-2" />
              Complete Analysis
            </Button>
          </div>
        </motion.div>
      )}

      {/* Home Button (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-teal-500/50 backdrop-blur-sm">
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={() => window.location.reload()}
            className="w-70 bg-teal-500 text-gray-900 font-extrabold text-lg py-3 rounded-xl shadow-lg hover:bg-teal-400 transition-colors duration-200 uppercase tracking-widest"
          >
            Go To Home Page
          </button>
        </div>
      </div>
    </div>
  );
}