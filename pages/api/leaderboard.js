import fs from 'fs/promises';
import path from 'path';

const LEADERBOARD_FILES = {
  numbers: path.resolve('./leaderboard.json'),
  'words-de': path.resolve('./leaderboard-2-64.json'),
};

export default async function handler(req, res) {
  try {
    const mode = req.query.mode || 'numbers';
    
    if (!LEADERBOARD_FILES[mode]) {
      return res.status(400).json({ error: `Invalid mode: ${mode}` });
    }

    const filePath = LEADERBOARD_FILES[mode];
    
    try {
      // Überprüfen, ob die Datei existiert
      await fs.access(filePath);
    } catch (error) {
      // Datei existiert nicht, erstelle eine leere Datei
      await fs.writeFile(filePath, '[]');
      return res.status(200).json([]);
    }

    // Lese die Datei
    const data = await fs.readFile(filePath, 'utf8');
    const leaderboard = JSON.parse(data);
    
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return res.status(500).json({ error: error.message });
  }
}
