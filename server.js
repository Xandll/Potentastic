const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// **WICHTIG:** Statische Dateien *vor* allen anderen Routen ausliefern!
app.use(express.static(path.join(__dirname)));

// Verwende /tmp für beschreibbare Dateien in Vercel
const DATA_DIR = '/tmp';
const LEADERBOARD_FILES = {
    'numbers': path.join(DATA_DIR, 'leaderboard.json'),
    'words-de': path.join(DATA_DIR, 'leaderboard-2-64.json')
};

console.log('\n=== Leaderboard Files Configuration ===');
console.log('Base directory:', __dirname);
for (const [mode, file] of Object.entries(LEADERBOARD_FILES)) {
    console.log(`${mode}:`, file);
}
console.log('=====================================\n');

console.log('\n=== Checking Leaderboard Files ===');
for (const [mode, file] of Object.entries(LEADERBOARD_FILES)) {
    if (fsSync.existsSync(file)) {
        const content = fsSync.readFileSync(file, 'utf8');
        console.log(`${mode}: File exists with content:`, content);
    } else {
        console.log(`${mode}: File does not exist`);
    }
}

async function initializeLeaderboardFiles() {
    console.log('\n=== Initializing Leaderboard Files ===');
    for (const [mode, file] of Object.entries(LEADERBOARD_FILES)) {
        try {
            await fs.access(file);
            const data = await fs.readFile(file, 'utf8');
            const content = JSON.parse(data);
            console.log(`${mode}: File exists with ${content.length} entries`);
        } catch {
            console.log(`${mode}: Creating new file at ${file}`);
            await fs.writeFile(file, '[]', 'utf8');
        }
    }
    console.log('=====================================\n');
}

async function resetLeaderboardFiles() {
    console.log('\n=== Resetting Leaderboard Files ===');
    for (const [mode, file] of Object.entries(LEADERBOARD_FILES)) {
        try {
            if (fsSync.existsSync(file)) {
                await fs.unlink(file);
                console.log(`Deleted existing file: ${file}`);
            }
            await fs.writeFile(file, '[]', 'utf8');
            console.log(`Created new empty file: ${file}`);
        } catch (error) {
            console.error(`Error resetting ${mode} file:`, error);
        }
    }
    console.log('=====================================\n');
}

if (process.env.NODE_ENV === 'development') {
    app.post('/reset-leaderboards', async (req, res) => {
        try {
            await resetLeaderboardFiles();
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

initializeLeaderboardFiles().catch(console.error);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/save-score', async (req, res) => {
    try {
        const { username, time, date, mode } = req.body;
        console.log('\n=== Save Score Request ===');
        console.log('Mode:', mode);
        console.log('Username:', username);
        console.log('Time:', time);

        if (!mode || !LEADERBOARD_FILES[mode]) {
            console.log('ERROR: Invalid mode:', mode);
            return res.status(400).json({ error: 'Invalid game mode' });
        }

        const leaderboardFile = LEADERBOARD_FILES[mode];
        console.log('Saving to file:', leaderboardFile);

        let leaderboard = [];
        try {
            const data = await fs.readFile(leaderboardFile, 'utf8');
            leaderboard = JSON.parse(data);
        } catch (error) {
            console.log('Creating new leaderboard file');
        }

        const existingIndex = leaderboard.findIndex(entry =>
            entry.username.toLowerCase() === username.toLowerCase()
        );

        if (existingIndex !== -1) {
            if (time < leaderboard[existingIndex].time) {
                leaderboard[existingIndex] = { username, time, date };
                console.log('Updated existing entry');
            } else {
                console.log('Existing score is better, keeping it');
            }
        } else {
            leaderboard.push({ username, time, date });
            console.log('Added new entry');
        }

        leaderboard.sort((a, b) => a.time - b.time);
        await fs.writeFile(leaderboardFile, JSON.stringify(leaderboard, null, 2));
        console.log('Successfully saved');
        console.log('======================\n');

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const mode = req.query.mode;
        console.log('\n=== Leaderboard Request ===');
        console.log('Request URL:', req.url);
        console.log('Mode from query:', mode);
        console.log('Query object:', req.query);

        if (!mode) {
            const error = 'Mode parameter is required';
            console.error(error);
            return res.status(400).json({ error });
        }

        if (!LEADERBOARD_FILES[mode]) {
            const error = `Invalid mode: ${mode}`;
            console.error(error);
            return res.status(400).json({ error });
        }

        const filePath = LEADERBOARD_FILES[mode];
        console.log('Attempting to read file:', filePath);

        if (!fsSync.existsSync(filePath)) {
            console.log('File does not exist, creating empty file');
            await fs.writeFile(filePath, '[]');
            return res.json([]);
        }

        const fileContent = await fs.readFile(filePath, 'utf8');
        console.log('File content:', fileContent);

        const leaderboard = JSON.parse(fileContent);
        console.log('Parsed leaderboard:', leaderboard);

        res.json(leaderboard);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/leaderboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// **WICHTIG:** Exportiere die App für Vercel!
module.exports = app;
