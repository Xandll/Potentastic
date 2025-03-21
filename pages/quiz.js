import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Quiz.module.css';

export default function Quiz() {
  const router = useRouter();
  const { username, mode } = router.query;
  
  const [currentExponent, setCurrentExponent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [usedExponents, setUsedExponents] = useState([]);
  const [wrongExponents, setWrongExponents] = useState([]);
  const [cardTransform, setCardTransform] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const maxExponent = 16;
  const allExponents = [...Array.from({ length: maxExponent + 1 }, (_, i) => i), 32];

  useEffect(() => {
    if (!router.isReady) return;
    
    // Only set loading to false after we have query parameters
    if (username) {
      setIsLoading(false);
      setStartTime(Date.now());
      generateQuestion();
    }
  }, [router.isReady, username]);

  useEffect(() => {
    if (!startTime) return;
    
    const timerInterval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [startTime]);
  
  function generateQuestion() {
    // Wenn alle Fragen richtig beantwortet wurden
    if (usedExponents.length === allExponents.length) {
      finishGame();
      return;
    }

    // Finde alle noch nicht verwendeten Exponenten
    const availableExponents = allExponents.filter(exp => !usedExponents.includes(exp));
    
    // Wähle einen zufälligen noch nicht verwendeten Exponenten
    const randomIndex = Math.floor(Math.random() * availableExponents.length);
    const nextExponent = availableExponents[randomIndex];
    setCurrentExponent(nextExponent);
    setUsedExponents([...usedExponents, nextExponent]);

    setAnswer('');
    setResult('');
    setCardTransform('');
  }
  
  function checkAnswer() {
    const userAnswer = parseInt(answer);
    const correctAnswer = Math.pow(2, currentExponent);
    
    if (userAnswer === correctAnswer) {
      setResult('Richtig! Gut gemacht!');
      setCardTransform(styles.slideRight);
      
      // Nur wenn die Antwort richtig ist, generiere eine neue Frage nach einer Verzögerung
      setTimeout(generateQuestion, 1000);
    } else {
      setResult('Falsch! Versuche es noch einmal.');
      setCardTransform(styles.slideLeft);
      
      // Bei falscher Antwort zurücksetzen, aber keine neue Frage generieren
      setTimeout(() => {
        setAnswer('');
        setCardTransform('');
      }, 1000);
    }
  }
  
  function finishGame() {
    setGameFinished(true);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    
    // Speichere den Score
    const date = new Date().toLocaleString();
    fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        time: timeTaken, 
        date,
        mode 
      })
    });
  }
  
  function restart() {
    setUsedExponents([]);
    setWrongExponents([]);
    setStartTime(Date.now());
    setGameFinished(false);
    generateQuestion();
  }
  
  function viewLeaderboard() {
    // Set a flag in localStorage to indicate navigation is happening
    localStorage.setItem('navigating', 'true');
    
    // Navigate with a slight delay to allow state to be saved
    router.push({
      pathname: '/leaderboard',
      query: { mode }
    });
  }
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Lade...</div>
      </div>
    );
  }
  
  if (!username) {
    return <div className={styles.container}>Lade...</div>;
  }
  
  return (
    <>
      <Head>
        <title>Potentastic Quiz</title>
        <link rel="icon" href="/favicon.png" />
        <style>{`
          body {
            background-color: #2c3e50;
            color: white;
            font-family: 'Arial', sans-serif;
          }
        `}</style>
      </Head>
      <div className={styles.pageTransition}>
        <h1>Potentastic</h1>
        <div className={styles.container}>
          {gameFinished ? (
            <div className={styles.endScreen}>
              <h2>Fertig!</h2>
              <p>Du hast {timer} Sekunden gebraucht.</p>
              <button className={styles.button} onClick={restart}>Neu starten</button>
              <button className={styles.button} onClick={viewLeaderboard}>Leaderboard anzeigen</button>
            </div>
          ) : (
            <>
              <div className={styles.timer}>Zeit: {timer} Sekunden</div>
              <div className={`${styles.card} ${cardTransform}`}>
                <div className={styles.question}>
                  Was ist 2<sup>{currentExponent}</sup>?
                </div>
                <input 
                  type="number" 
                  className={styles.input}
                  value={answer} 
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <button className={styles.button} onClick={checkAnswer}>Antwort überprüfen</button>
                <div className={styles.result} style={{color: result.includes('Richtig') ? 'green' : 'red'}}>
                  {result}
                </div>
              </div>
            </>
          )}
        </div>
        <footer>
          <span className="copyright">
            © 2025 Potentastic - All rights reserved by <a href="https://xandll.com" target="_blank" className="copyright-link" rel="noopener noreferrer">xandll.com</a>
          </span>
        </footer>
      </div>
    </>
  );
}
