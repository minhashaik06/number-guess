import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import NumberDisplay from './components/NumberDisplay';
import GuessHistory from './components/GuessHistory';
import confetti from 'canvas-confetti';

const DIFFICULTY = {
  Easy: 50,
  Medium: 100,
  Hard: 200,
};

function App() {
  const [difficulty, setDifficulty] = useState('Medium');
  const [maxNumber, setMaxNumber] = useState(DIFFICULTY['Medium']);
  const [secretNumber, setSecretNumber] = useState(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [feedback, setFeedback] = useState('Make a guess...');
  const [attempts, setAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing | won
  const [highScore, setHighScore] = useState(() => {
    const v = localStorage.getItem('numguess_highscore_' + difficulty);
    return v ? Number(v) : null;
  });
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    // Persist high score per difficulty
    if (highScore != null) {
      localStorage.setItem('numguess_highscore_' + difficulty, String(highScore));
    }
  }, [highScore, difficulty]);

  useEffect(() => {
    // optional sound effects could be wired here
    // play short sound on win using HTMLAudio if desired
  }, [feedback]);

  // Math hint helper functions
  function isPerfectSquare(n) {
    const sqrt = Math.sqrt(n);
    return sqrt === Math.floor(sqrt);
  }

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function getNumberHint(n) {
    const hints = [];
    if (isPerfectSquare(n)) hints.push("This number is a perfect square");
    if (isPrime(n)) hints.push("Think of prime numbers");
    if (n % 2 === 0) hints.push("It's an even number");
    if (n % 3 === 0) hints.push("It's divisible by 3");
    if (n % 5 === 0) hints.push("It's divisible by 5");
    if (hints.length === 0) {
      const nearestSquare = Math.floor(Math.sqrt(n)) ** 2;
      hints.push(`It's ${n - nearestSquare} more than ${nearestSquare}`);
    }
    return hints[Math.floor(Math.random() * hints.length)];
  }

  function handleGetHint() {
    const hint = getNumberHint(secretNumber);
    setCurrentHint(hint);
    setHintsUsed(prev => prev + 1);
  }

  function initGame() {
    const maxN = DIFFICULTY[difficulty];
    setMaxNumber(maxN);
    const secret = Math.floor(Math.random() * maxN) + 1;
    setSecretNumber(secret);
    setCurrentGuess('');
    setFeedback('Make a guess...');
    setAttempts(0);
    setGuessHistory([]);
    setGameStatus('playing');
    setWrongGuesses(0);
    setHintsUsed(0);
    setCurrentHint('');
    const stored = localStorage.getItem('numguess_highscore_' + difficulty);
    setHighScore(stored ? Number(stored) : null);
    if (inputRef.current) inputRef.current.focus();
  }

  function validateGuess(value) {
    const n = Number(value);
    if (!Number.isInteger(n)) return 'Please enter a whole number.';
    if (n < 1 || n > maxNumber) return `Enter a number between 1 and ${maxNumber}.`;
    return null;
  }

  function handleGuessSubmit(e) {
    e && e.preventDefault();
    if (gameStatus === 'won') return;
    const err = validateGuess(currentGuess);
    if (err) {
      setFeedback(err);
      return;
    }
    const guessNum = Number(currentGuess);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setGuessHistory(prev => [{ value: guessNum, time: Date.now() }, ...prev]);

    if (guessNum === secretNumber) {
      setFeedback(`Correct! 🎉 It was ${secretNumber}`);
      setGameStatus('won');
      // update high score
      if (highScore == null || nextAttempts < highScore) {
        setHighScore(nextAttempts);
      }
      // confetti
      confetti({ particleCount: 180, spread: 70, origin: { y: 0.4 } });
    } else {
      // Track wrong guesses for hint system
      setWrongGuesses(prev => prev + 1);
      if (guessNum > secretNumber) {
        setFeedback('Too High! 🔥');
      } else {
        setFeedback('Too Low! ❄️');
      }
    }
    setCurrentGuess('');
    if (inputRef.current) inputRef.current.focus();
  }

  function handleRestart() {
    if (!window.confirm('Restart the game? Your current progress will be lost.')) return;
    initGame();
  }

  function handleDifficultyChange(e) {
    const d = e.target.value;
    setDifficulty(d);
  }

  const feedbackClass = gameStatus === 'won' ? 'feedback win' : feedback.includes('High') ? 'feedback high' : feedback.includes('Low') ? 'feedback low' : 'feedback neutral';

  return (
    <div className="app-root">
      <div className="container">
        <header className="header">
          <h1>NumGuess Pro</h1>
          <p className="tag">Guess the secret number — fast and fun</p>
        </header>

        <main className="main-grid">
          <section className="panel game-panel">
            <div className="top-row">
              <div className="score">
                <div className="score-label">Attempts</div>
                <div className="score-value">{attempts}</div>
              </div>
              <div className="highscore">
                <div className="score-label">High Score</div>
                <div className="score-value">{highScore ?? '—'}</div>
              </div>
            </div>

            <div className="number-box">
              <NumberDisplay value={currentGuess || '?'} animate={!currentGuess} />
            </div>

            <div className={feedbackClass} role="status">{feedback}</div>
            {currentHint && (
              <div className="hint-message" role="status">
                💡 Hint: {currentHint}
                <div className="hint-count">Hints used: {hintsUsed}</div>
              </div>
            )}

            <form className="guess-form" onSubmit={handleGuessSubmit}>
              <label className="sr-only" htmlFor="guess">Your guess</label>
              <input
                id="guess"
                ref={inputRef}
                className="guess-input"
                value={currentGuess}
                onChange={e => setCurrentGuess(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={`Enter 1-${maxNumber}`}
                inputMode="numeric"
                maxLength={String(maxNumber).length}
                aria-label="Enter your guess"
              />
              <button type="submit" className="btn primary">Guess</button>
              <button type="button" className="btn ghost" onClick={handleRestart}>Restart</button>
              {wrongGuesses >= 3 && gameStatus !== 'won' && (
                <button type="button" className="btn hint" onClick={handleGetHint}>Get Math Hint</button>
              )}
            </form>

            <div className="controls">
              <label>Difficulty:</label>
              <select value={difficulty} onChange={handleDifficultyChange} className="difficulty-select">
                {Object.keys(DIFFICULTY).map(d => (
                  <option key={d} value={d}>{d} (1-{DIFFICULTY[d]})</option>
                ))}
              </select>
            </div>
          </section>

          <aside className="panel history-panel">
            <h2>Guess History</h2>
            <GuessHistory items={guessHistory} />
          </aside>
        </main>

        <footer className="footer">
          <small>Built with React • Responsive • Accessible</small>
        </footer>
      </div>
    </div>
  );
}

export default App;
