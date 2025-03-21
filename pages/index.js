import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [username, setUsername] = useState('');
  const [gameMode, setGameMode] = useState('numbers');

  const startQuiz = () => {
    if (!username) {
      alert('Bitte gib deinen Benutzernamen ein.');
      return;
    }
    // Weiterleitung zur Quiz-Seite
    window.location.href = `/quiz?username=${username}&mode=${gameMode}`;
  };

  return (
    <>
      <Head>
        <title>Potentastic</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className={styles.container}>
        <h1>Potentastic</h1>
        <div className={styles.startScreen} style={{ margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Benutzername eingeben"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select 
            value={gameMode} 
            onChange={(e) => setGameMode(e.target.value)} 
            className={styles.select} // Ensure this class is applied
          >
            <option value="numbers">Standard</option>
            <option value="words-de">2^64</option>
          </select>
          <button onClick={startQuiz}>Starten</button>
          <button onClick={() => (window.location.href = '/leaderboard')}>Leaderboard anzeigen</button>
        </div>
      </div>
      <footer>
        <span className="copyright">
          © 2025 Potentastic - All rights reserved by <a href="https://xandll.com" target="_blank" className="copyright-link" rel="noopener noreferrer">xandll.com</a>
        </span>
      </footer>
    </>
  );
}
