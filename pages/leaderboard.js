import { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Leaderboard.module.css';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [mode, setMode] = useState('numbers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching leaderboard for mode: ${mode}`);
        
        const response = await fetch(`/api/leaderboard?mode=${mode}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        console.log('Leaderboard data:', data);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, [mode]);

  return (
    <>
      <Head>
        <title>Potentastic Leaderboard</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <h1>Potentastic Leaderboard</h1>
      <div className={styles.container}>
        <select
          className={styles.select}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="numbers">Standard</option>
          <option value="words-de">2^64</option>
        </select>
        
        {loading && <p>Lade Leaderboard...</p>}
        
        {error && <p className={styles.error}>Fehler: {error}</p>}
        
        {!loading && !error && (
          <ul className={styles.list}>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.username}>{entry.username}</span>
                  <span className={styles.time}>{entry.time} Sekunden</span>
                  <span className={styles.date}>{entry.date}</span>
                </li>
              ))
            ) : (
              <li className={styles.listItem}>Noch keine Einträge vorhanden</li>
            )}
          </ul>
        )}
        
        <button className={styles.button} onClick={() => (window.location.href = '/')}>
          Zurück zum Spiel
        </button>
      </div>
      <footer>
        <span className="copyright">
          © 2025 Potentastic - All rights reserved by <a href="https://xandll.com" target="_blank" className="copyright-link" rel="noopener noreferrer">xandll.com</a>
        </span>
      </footer>
    </>
  );
}
