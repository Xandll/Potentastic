function getServerUrl() {
    return window.location.origin; // Gibt die Basis-URL des aktuellen Servers zurück
}

const maxExponent = 16; // Maximaler Exponent für die Frage
const exponents = Array.from({ length: maxExponent + 1 }, (_, i) => i);
exponents.push(32); // Füge 32 hinzu
let currentExponent;
let usedExponents = [];
let wrongExponents = [];
let correctAnswers = 0;
let startTime; // Variable für den Startzeitpunkt
let timerInterval; // Variable für den Timer-Interval
let username; // Variable für den Benutzernamen

const CORRECT_ANSWER_DE = "achtzehnquintillionvierhundertsechsundvierzigquadrillionsiebenhundertundvierundvierzigtrilliardendreihundertdreiundsiebzigtrillionensiebenhundertneunundneunzigbilliardenvierhundertfünfundfünfzigbillionensechshundertzweiundsechzigmilliardenfünfhundertsiebenundsechzigmillionenfünfhundertundfünfunddreißigtausendzweihundertsechzehn";
const CORRECT_ANSWER_EN = "eighteenquintillionforhundredfortysixquadrillionsevenhundredfortyfourtrillionthreehundredseventythreetrillionsevenhundredninetyninebillionsfourhundredfiftyfivebillionsixhundredsixtytwoamillionfivehundredsixtysevenmillionfivehundredthirtyfivethousandtwohundredsixteen";

let gameMode = 'numbers'; // Setze Standardmodus

function generateQuestion() {
    // Wenn alle Fragen richtig beantwortet wurden
    if (usedExponents.length === exponents.length && wrongExponents.length === 0) {
        showEndScreen();
        return;
    }

    // Wenn es falsche Antworten gibt, wähle eine davon
    if (wrongExponents.length > 0) {
        const randomIndex = Math.floor(Math.random() * wrongExponents.length);
        currentExponent = wrongExponents[randomIndex];
    } else {
        // Finde alle noch nicht verwendeten Exponenten
        const availableExponents = exponents.filter(exp => !usedExponents.includes(exp));
        
        // Wähle einen zufälligen noch nicht verwendeten Exponenten
        const randomIndex = Math.floor(Math.random() * availableExponents.length);
        currentExponent = availableExponents[randomIndex];
        usedExponents.push(currentExponent);
    }

    document.getElementById('question').innerHTML = 
        `Was ist 2<sup>${currentExponent}</sup>?`;
    document.getElementById('result').innerText = '';
    document.getElementById('userAnswer').value = '';
    document.getElementById('card').style.transform = 'translateX(0)';
}

function checkAnswer() {
    if (gameMode === 'numbers') {
        checkNumberAnswer();
    } else {
        checkWordAnswer();
    }
}

function checkWordAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.replace(/\s+/g, '');
    const correctAnswer = "18446744073709551616";  // 2^64
    const resultDiv = document.getElementById('result');

    if (userAnswer === correctAnswer) {
        resultDiv.innerText = 'Richtig! Gut gemacht!';
        resultDiv.style.color = 'green';
        showEndScreen();
    } else {
        resultDiv.innerText = 'Falsch! Versuche es noch einmal.';
        resultDiv.style.color = 'red';
    }
}

function checkNumberAnswer() {
    const userAnswer = parseInt(document.getElementById('userAnswer').value);
    const correctAnswer = Math.pow(2, currentExponent);
    const resultDiv = document.getElementById('result');

    if (userAnswer === correctAnswer) {
        resultDiv.innerText = 'Richtig! Gut gemacht!';
        resultDiv.style.color = 'green';
        correctAnswers++;
        document.getElementById('card').style.transform = 'translateX(100%)';
        
        wrongExponents = wrongExponents.filter(exp => exp !== currentExponent);
        
        setTimeout(generateQuestion, 600);
    } else {
        resultDiv.innerText = 'Falsch!';
        resultDiv.style.color = 'red';
        document.getElementById('card').style.transform = 'translateX(-100%)';
        
        if (!wrongExponents.includes(currentExponent)) {
            wrongExponents.push(currentExponent);
        }
        
        setTimeout(generateQuestion, 600);
    }
}

function showEndScreen() {
    clearInterval(timerInterval); // Stoppe den Timer
    document.getElementById('card').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    
    // Berechne die Zeit und zeige sie an
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Zeit in Sekunden
    document.getElementById('time').innerText = `Zeit: ${timeTaken} Sekunden`;
    
    // Speichere den Score im Leaderboard
    saveScore(username, timeTaken);
}

async function saveScore(username, timeTaken) {
    const date = new Date().toLocaleString();
    try {
        await fetch(`${getServerUrl()}/save-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, 
                time: timeTaken, 
                date,
                mode: gameMode 
            })
        });
    } catch (error) {
        console.error('Failed to save score:', error);
    }
}

// Timer-Funktion
function updateTimer() {
    const currentTime = Math.floor((new Date() - startTime) / 1000);
    document.getElementById('timer').innerText = `Zeit: ${currentTime} Sekunden`;
}
    
// Event Listener für den Start-Button
document.getElementById('startQuiz').addEventListener('click', () => {
    username = document.getElementById('username').value;
    gameMode = document.getElementById('gameMode').value;
    
    if (username) {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('card').classList.remove('hidden');
        document.getElementById('timer').classList.remove('hidden');
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        
        // Reset input type based on game mode
        const userAnswerInput = document.getElementById('userAnswer');
        if (gameMode === 'numbers') {
            userAnswerInput.type = 'number';
            userAnswerInput.placeholder = 'Deine Antwort';
            generateQuestion();
        } else {
            userAnswerInput.type = 'text';
            userAnswerInput.placeholder = gameMode === 'words-de' ? 
                'Zahl in deutschen Worten' : 'Number in English words';
            showWordsQuestion();
        }
    } else {
        alert("Bitte gib deinen Benutzernamen ein.");
    }
});

// Event Listener für den Benutzernamen
document.getElementById('username').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('startQuiz').click(); // Simuliere einen Klick auf den Start-Button
    }
});

// Event Listener für den Button
document.getElementById('submitAnswer').addEventListener('click', checkAnswer);

// Event Listener für die Enter-Taste
document.getElementById('userAnswer').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Event Listener für den Neustart-Button
document.getElementById('restartQuiz').addEventListener('click', () => {
    // Reset all game variables
    usedExponents = [];
    wrongExponents = [];
    correctAnswers = 0;
    
    // Reset timer
    clearInterval(timerInterval); // Clear existing timer
    startTime = new Date(); // Reset start time
    timerInterval = setInterval(updateTimer, 1000); // Start new timer
    
    // Reset UI
    document.getElementById('endScreen').classList.add('hidden');
    document.getElementById('card').classList.remove('hidden');
    document.getElementById('timer').classList.remove('hidden');
    
    // Reset input type based on game mode
    const userAnswerInput = document.getElementById('userAnswer');
    if (gameMode === 'numbers') {
        userAnswerInput.type = 'number';
        userAnswerInput.placeholder = 'Deine Antwort';
        generateQuestion();
    } else {
        userAnswerInput.type = 'text';
        userAnswerInput.placeholder = gameMode === 'words-de' ? 
            'Zahl in deutschen Worten' : 'Number in English words';
        showWordsQuestion();
    }
});

// Event Listener für die Leaderboard-Buttons
document.getElementById('viewLeaderboardStart').addEventListener('click', () => {
    window.location.href = `/leaderboard.html?mode=${gameMode}`;
});

document.getElementById('viewLeaderboardEnd').addEventListener('click', () => {
    window.location.href = `/leaderboard.html?mode=${gameMode}`;
});

// Event Listener für den Zurück-Button im Leaderboard
document.getElementById('backToMenu').addEventListener('click', () => {
    document.getElementById('leaderboard').classList.add('hidden');
});

function showWordsQuestion() {
    document.getElementById('question').innerHTML = '2<sup>64</sup> = ?';
    document.getElementById('userAnswer').type = 'text';
    document.getElementById('userAnswer').placeholder = 'Zahl eingeben (ohne Leerzeichen)';
}

// Starte das Quiz mit der ersten Frage

/*// Add this after other event listeners
document.getElementById('debugFinish').addEventListener('click', () => {
    // Mark all questions as completed
    usedExponents = [...exponents];
    wrongExponents = [];
    correctAnswers = exponents.length;

    // Stop timer
    clearInterval(timerInterval);

    // Hide quiz elements
    document.getElementById('card').classList.add('hidden');
    document.getElementById('timer').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');

    // Show end screen with perfect score
    showEndScreen();
});

// Make sure startTime is set when debug button is clicked
if (!startTime) {
    startTime = new Date();
}*/