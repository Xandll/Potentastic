let currentMode = 'numbers';

function getServerUrl() {
    return window.location.origin;
}

// Funktion zum Auslesen der URL-Parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(name);
    console.log(`Getting URL parameter "${name}":`, value);
    return value || 'numbers';
}

async function loadLeaderboard() {
    try {
        console.log('\n=== Loading Leaderboard ===');
        console.log('Current mode:', currentMode);

        // Erstelle die URL mit dem Mode-Parameter
        const url = new URL(`${getServerUrl()}/leaderboard`);
        url.searchParams.set('mode', currentMode);
        console.log('Request URL:', url.toString());

        // Führe den Request aus
        const response = await fetch(url);
        console.log('Response status:', response.status);

        // Hole den Response-Text für Debug-Zwecke
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Parse die Antwort
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Invalid server response');
        }

        // Überprüfe auf Fehlermeldung
        if (data.error) {
            throw new Error(data.error);
        }

        console.log('Parsed data:', data);

        // Aktualisiere die Anzeige
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            const modeName = currentMode === 'numbers' ? 'Standard' : '2^64';
            leaderboardList.innerHTML = `<li class="leaderboard-entry" style="white-space: nowrap;">Keine Einträge für ${modeName}</li>`;
            return;
        }

        data.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-entry';
            li.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="username">${entry.username}</span>
                <span class="time">${entry.time} Sekunden</span>
                <span class="date">${entry.date}</span>
            `;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboardList').innerHTML = 
            `<li class="leaderboard-entry">Fehler: ${error.message}</li>`;
    }
}

function createModeSelector() {
    const selector = document.createElement('div');
    selector.className = 'mode-selector';
    selector.innerHTML = `
        <select id="modeSelect">
            <option value="numbers">Standard</option>
            <option value="words-de">2^64</option>
        </select>
    `;
    document.querySelector('.leaderboard').insertBefore(
        selector, 
        document.getElementById('leaderboardList')
    );

    const modeSelect = document.getElementById('modeSelect');
    
    // Setze den initialen Wert
    modeSelect.value = currentMode;
    console.log('Setting initial mode to:', currentMode); // Debug log

    modeSelect.addEventListener('change', (e) => {
        currentMode = e.target.value;
        console.log('Mode changed to:', currentMode); // Debug log
        
        // Aktualisiere die URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('mode', currentMode);
        window.history.pushState({}, '', newUrl);
        
        // Lade das neue Leaderboard
        loadLeaderboard();
    });
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const urlMode = getUrlParameter('mode');
    console.log('URL parameter "mode":', urlMode);
    console.log('URL search string:', window.location.search);
    
    currentMode = urlMode;
    console.log('Set current mode to:', currentMode);
    
    createModeSelector();
    loadLeaderboard();
});

document.getElementById('backToGame').addEventListener('click', () => {
    window.location.href = '/';
}); 