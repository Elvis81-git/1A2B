import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Clock, Flame, Award, CheckCircle, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import GameBoard from './GameBoard';
import HistoryList, { GuessItem } from './HistoryList';

interface SinglePlayerProps {
  onBackToMenu: () => void;
  onWin: () => void;
  onGameOver: () => void;
}

export default function SinglePlayer({ onBackToMenu, onWin, onGameOver }: SinglePlayerProps) {
  const [secret, setSecret] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessItem[]>([]);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secretRef = useRef<string>('');

  // Generate secret number
  const generateSecret = () => {
    const digits: number[] = [];
    while (digits.length < 4) {
      const r = Math.floor(Math.random() * 10);
      if (!digits.includes(r)) {
        digits.push(r);
      }
    }
    const sec = digits.join('');
    setSecret(sec);
    secretRef.current = sec; // Set ref synchronously
    console.log('SinglePlayer Secret:', sec); // For debug/dev testing
  };

  // Start new game
  const initGame = () => {
    generateSecret();
    setGuesses([]);
    setIsWin(false);
    setTimeElapsed(0);
    setTimerActive(true);
  };

  // Initial load
  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Format time (e.g. 02:45)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Submit Guess handler
  const handleGuessSubmit = (guess: string) => {
    const activeSecret = secretRef.current || secret;
    let a = 0;
    let b = 0;
    for (let i = 0; i < 4; i++) {
      if (guess[i] === activeSecret[i]) {
        a++;
      } else if (activeSecret.includes(guess[i])) {
        b++;
      }
    }

    const newGuess: GuessItem = {
      guess,
      result: `${a}A${b}`,
    };

    const nextGuesses = [...guesses, newGuess];
    setGuesses(nextGuesses);

    // Check Win
    if (a === 4) {
      setIsWin(true);
      setTimerActive(false);
      onWin();
      
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '900px',
        animation: 'slideInUp 0.4s ease-out',
      }}
    >
      {/* Top bar with stats */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>歷時</span>
            <strong style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              {formatTime(timeElapsed)}
            </strong>
          </div>
          {/* Attempt Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} style={{ color: 'var(--status-warning)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>猜測次數</span>
            <strong style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              {guesses.length}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={initGame} style={{ padding: '8px 12px' }}>
            <RefreshCw size={14} /> 重玩
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="battle-arena">
        {/* Left Side: Game Board */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GameBoard onSubmit={handleGuessSubmit} disabled={isWin} />
        </div>

        {/* Right Side: Guesses History */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <HistoryList guesses={guesses} title="單人模式猜測歷史" />
        </div>
      </div>

      {/* Win Modal Overlay */}
      {isWin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '0 25px 60px rgba(139, 92, 246, 0.25)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              animation: 'scaleInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-success)',
                marginBottom: '0.5rem',
              }}
            >
              <Award size={40} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--status-success)' }}>
                解鎖成功！
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                恭喜！您成功破解了這個密碼。
              </p>
            </div>

            {/* Victory Statistics Card */}
            <div
              className="glass-panel"
              style={{
                width: '100%',
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>正確答案</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '3px', marginTop: '4px' }}>
                  {secret}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--panel-border)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>嘗試次數</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {guesses.length} 次
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--panel-border)', gridColumn: 'span 2', paddingTop: '10px', marginTop: '4px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>花費時間</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onBackToMenu}
              >
                <Home size={16} /> 回首頁
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1.5 }}
                onClick={initGame}
              >
                <RefreshCw size={16} /> 再玩一次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
