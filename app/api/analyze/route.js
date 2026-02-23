// app/api/analyze/route.js
export const maxDuration = 300;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: "Gemini API key not configured on server." }, { status: 500 });
  }

  // Parse multipart form data (file upload from browser)
  const formData = await request.formData();
  const file = formData.get("video");
  const jerseyDescription = formData.get("jerseyDescription");
  const positionId = formData.get("positionId");

  if (!file || !jerseyDescription || !positionId) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    // ── Step 1: Upload file directly to Gemini Files API ──
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type || "video/mp4";

    const uploadRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=multipart&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: fileBuffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return Response.json({ error: `Gemini upload failed: ${err}` }, { status: 500 });
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData.file?.uri;
    const fileName = uploadData.file?.name;

    if (!fileUri) {
      return Response.json({ error: "No file URI returned from Gemini." }, { status: 500 });
    }

    // ── Step 2: Poll until ACTIVE ──
    let fileState = uploadData.file?.state;
    let attempts = 0;

    while (fileState === "PROCESSING" && attempts < 60) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`
      );
      const pollData = await pollRes.json();
      fileState = pollData.state;
      attempts++;
    }

    if (fileState !== "ACTIVE") {
      return Response.json({ error: `File processing failed with state: ${fileState}` }, { status: 500 });
    }

    // ── Step 3: Analyze with Gemini ──
    const prompt = buildPrompt(jerseyDescription, positionId);

    const analysisRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { file_data: { mime_type: mimeType, file_uri: fileUri } },
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!analysisRes.ok) {
      const err = await analysisRes.text();
      return Response.json({ error: `Gemini analysis failed: ${err}` }, { status: 500 });
    }

    const analysisData = await analysisRes.json();
    const rawText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ── Step 4: Parse JSON ──
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Could not extract stats from Gemini response." }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const sanitized = {};
    Object.entries(parsed).forEach(([k, v]) => {
      sanitized[k] = Math.max(0, Math.round(Number(v) || 0));
    });

    return Response.json({ stats: sanitized });

  } catch (err) {
    console.error("analyze route error:", err);
    return Response.json({ error: err.message || "Unknown server error." }, { status: 500 });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFENSIVE_POSITIONS = ['left_center_back', 'right_center_back', 'left_back', 'right_back'];

const STAT_NAMES = {
  goals:'Non-Penalty Goals', shot_creation:'Shots Taken', big_chances_missed:'Big Chances Missed',
  off_target_shots:'Shots Off Target', penalties:'Penalties Scored', penalties_missed:'Penalties Missed',
  assists:'Assists', big_chances_made:'Big Chances Made', key_passes:'Key Passes',
  crosses:'Successful Crosses', crosses_missed:'Missed Crosses', passes_own_half:'Passes in Own Half',
  passes_missed_oh:'Passes Missed (Own Half)', passes_opp_half:'Passes in Opp Half',
  passes_missed_ah:'Passes Missed (Opp Half)', longBallsAccurate:'Accurate Long Balls',
  longBallMissed:'Missed Long Balls', dribbles:'Dribbles',
  mistakes:'Mistakes (Offsides/Unsuccessful Dribbles)', unsuccessful_touches:'Unsuccessful Touches',
  penalties_won:'Penalties Won', fouls_won:'Fouls Won', possession_lost:'Possessions Lost',
  errors_chance:'Errors Leading to Chance/Goal', tackles:'Tackles', interceptions:'Interceptions',
  clearances:'Clearances', blocks:'Blocked Shots', penalties_committed:'Penalties Committed',
  goal_line_clearances:'Goal-Line Clearances', dribbled_past:'Dribbled Past', recoveries:'Recoveries',
  duels_won:'Duels Won', duels_lost:'Duels Lost', fouls_committed:'Fouls Committed',
  yellow_cards:'Yellow Cards', red_card:'Red Card',
  cleanSheet:'Clean Sheet', goalsConceded:'Goals Conceded', totalSaves:'Total Saves',
  savesInBox:'Saves Inside The Box', punches:'Punches', runsOut:'Successful Runs Out',
  unsucessfullRunsOut:'Unsuccessful Runs Out', highClaims:'High Claims',
  gkErrorShot:'Errors Leading To Shot', gkErrorGoal:'Errors Leading To Goals',
  penaltySaved:'Penalties Saved', penaltyConceded:'Penalties Conceded',
};

const ALL_STAT_IDS = [
  'goals','shot_creation','big_chances_missed','off_target_shots','penalties','penalties_missed',
  'assists','big_chances_made','key_passes','crosses','crosses_missed','passes_own_half',
  'passes_missed_oh','passes_opp_half','passes_missed_ah','longBallsAccurate','longBallMissed',
  'dribbles','mistakes','unsuccessful_touches','penalties_won','fouls_won','possession_lost',
  'errors_chance','tackles','interceptions','clearances','blocks','penalties_committed',
  'goal_line_clearances','dribbled_past','recoveries','duels_won','duels_lost','fouls_committed',
  'yellow_cards','red_card',
];

const GK_STAT_IDS = [
  'cleanSheet','goalsConceded','totalSaves','savesInBox','punches','runsOut',
  'unsucessfullRunsOut','highClaims','gkErrorShot','gkErrorGoal','penaltySaved','penaltyConceded',
];

const DEFENDER_STAT_IDS = ['goalsConceded'];

function buildPrompt(jerseyDescription, positionId) {
  const isGK = positionId === 'goalkeeper';
  const isDefender = DEFENSIVE_POSITIONS.includes(positionId);

  const statList = [
    ...ALL_STAT_IDS,
    ...(isGK ? GK_STAT_IDS : []),
    ...(isDefender ? DEFENDER_STAT_IDS : []),
  ];

  const statLines = statList.map(id => `  "${id}": <count>  // ${STAT_NAMES[id]}`).join('\n');

  return `You are a football (soccer) performance analyst. Watch this match video carefully.

The player I want you to track and analyze is: ${jerseyDescription}

Count every instance of the following actions performed BY THIS PLAYER AND ONLY THIS PLAYER. Be as accurate as possible. If unsure about a stat, set it to 0.

Return ONLY a valid JSON object with these exact keys and integer values (no explanation, no markdown, no extra text):

{
${statLines}
}

Important notes:
- Only count actions by the specific player described above
- "goals" = non-penalty goals only
- "mistakes" = offsides + unsuccessful dribbles combined
- "possession_lost" = times the player lost the ball under pressure
- "errors_chance" = errors directly leading to an opposition chance or goal
${isGK ? `- This player is the GOALKEEPER - focus heavily on saves, runs out, distribution and errors` : ''}
${isDefender ? `- Track "goalsConceded" = number of goals scored against the team while this player was on the pitch` : ''}`;
}
