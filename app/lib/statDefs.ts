const outfieldStats = [
  { id: 'goals', name: 'Non-Penalty Goals' },
  { id: 'shot_creation', name: 'Shots Taken' },
  { id: 'big_chances_missed', name: 'Big Chances Missed' },
  { id: 'off_target_shots', name: 'Shots Off Target' },
  { id: 'penalties', name: 'Penalties Scored' },
  { id: 'penalties_missed', name: 'Penalties Missed' },
  { id: 'assists', name: 'Assists' },
  { id: 'big_chances_made', name: 'Big Chances Made' },
  { id: 'key_passes', name: 'Key Passes' },
  { id: 'crosses', name: 'Successful Crosses' },
  { id: 'crosses_missed', name: 'Missed Crosses' },
  { id: 'passes_own_half', name: 'Passes in Own Half' },
  { id: 'passes_missed_oh', name: 'Passes Missed in Own Half' },
  { id: 'passes_opp_half', name: 'Passes in Opposition Half' },
  { id: 'passes_missed_ah', name: 'Passes Missed in Opposition Half' },
  { id: 'longBallsAccurate', name: 'Accurate Long Balls' },
  { id: 'longBallMissed', name: 'Missed Long Balls' },
  { id: 'dribbles', name: 'Dribbles' },
  { id: 'mistakes', name: 'Mistakes (Offsides, Unsuccessful Dribbles)' },
  { id: 'unsuccessful_touches', name: 'Unsuccessful Touches' },
  { id: 'penalties_won', name: 'Penalties Won' },
  { id: 'fouls_won', name: 'Fouls Won' },
  { id: 'possession_lost', name: 'Possessions Lost' },
  { id: 'errors_chance', name: 'Errors Leading to Chance or Goal' },
  { id: 'tackles', name: 'Tackles' },
  { id: 'interceptions', name: 'Interceptions' },
  { id: 'clearances', name: 'Clearances' },
  { id: 'blocks', name: 'Blocked Shots' },
  { id: 'penalties_committed', name: 'Penalties Committed' },
  { id: 'goal_line_clearances', name: 'Goal-Line Clearances' },
  { id: 'dribbled_past', name: 'Dribbled Past' },
  { id: 'recoveries', name: 'Recoveries' },
  { id: 'duels_won', name: 'Duels Won' },
  { id: 'duels_lost', name: 'Duels Lost' },
  { id: 'fouls_committed', name: 'Fouls Committed' },
  { id: 'yellow_cards', name: 'Yellow Cards' },
  { id: 'red_card', name: 'Red Card' },
];

const gkStats = [
  { id: 'cleanSheet', name: 'Clean Sheets' },
  { id: 'goalsConceded', name: 'Goals Conceded' },
  { id: 'totalSaves', name: 'Total Saves' },
  { id: 'savesInBox', name: 'Saves Inside The Box' },
  { id: 'punches', name: 'Punches' },
  { id: 'runsOut', name: 'Successful Runs Out' },
  { id: 'unsucessfullRunsOut', name: 'Unsuccessful Runs Out' },
  { id: 'highClaims', name: 'High Claims' },
  { id: 'gkErrorShot', name: 'Errors Leading To Shot' },
  { id: 'gkErrorGoal', name: 'Errors Leading To Goals' },
  { id: 'penaltySaved', name: 'Penalties Saved' },
  { id: 'penaltyConceded', name: 'Penalties Conceded' },
];

const defensiveExtraStats = [
  { id: 'goals_conceded', name: 'Goals Conceded' },
];

const allStatDefs = [...outfieldStats, ...gkStats, ...defensiveExtraStats];

const statLabels: Record<string, string> = {};
allStatDefs.forEach((s) => { statLabels[s.id] = s.name; });

export { outfieldStats, gkStats, defensiveExtraStats, allStatDefs, statLabels };
