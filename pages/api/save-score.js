import fs from 'fs/promises';
import path from 'path';

const LEADERBOARD_FILES = {
  numbers: path.resolve('./leaderboard.json'),
  'words-de': path.resolve('./leaderboard-2-64.json'),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, time, date, mode } = req.body;

  if (!mode || !LEADERBOARD_FILES[mode]) {
    return res.status(400).json({ error: 'Invalid game mode' });
  }

  const filePath = LEADERBOARD_FILES[mode];
  let leaderboard = [];

  try {
    const data = await fs.readFile(filePath, 'utf8');
    leaderboard = JSON.parse(data);
  } catch {
    // Datei existiert nicht, starte mit leerem Array
  }

  const existingIndex = leaderboard.findIndex(
    (entry) => entry.username.toLowerCase() === username.toLowerCase()
  );

  if (existingIndex !== -1) {
    if (time < leaderboard[existingIndex].time) {
      leaderboard[existingIndex] = { username, time, date };
    }
  } else {
    leaderboard.push({ username, time, date });
  }

  leaderboard.sort((a, b) => a.time - b.time);
  await fs.writeFile(filePath, JSON.stringify(leaderboard, null, 2));

  res.status(200).json({ success: true });
}
