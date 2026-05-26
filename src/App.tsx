import { useState, useEffect } from 'react';
import { HelpCircle, Moon, Sun, ArrowLeft } from 'lucide-react';
import ModeSelector from './components/ModeSelector';
import SinglePlayer from './components/SinglePlayer';
import Multiplayer from './components/Multiplayer';
import RulesModal from './components/RulesModal';

export type GameMode = 'menu' | 'single' | 'multi';

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [stats, setStats] = useState({
    singleWins: 0,
    singleTotal: 0,
    multiWins: 0,
    multiTotal: 0,
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load stats
  useEffect(() => {
    const storedStats = localStorage.getItem('1a2b_stats');
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const updateStats = (type: 'singleWins' | 'singleTotal' | 'multiWins' | 'multiTotal') => {
    setStats(prev => {
      const next = { ...prev, [type]: prev[type] + 1 };
      localStorage.setItem('1a2b_stats', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      {/* Background blobs for premium neon style */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header>
        <div className="logo-container">
          {mode !== 'menu' && (
            <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setMode('menu')}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="logo-badge">1A2B</div>
          <span className="logo-text">數字大決戰</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '10px' }} onClick={() => setIsRulesOpen(true)} title="玩法說明">
            <HelpCircle size={20} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px' }} onClick={toggleTheme} title={theme === 'dark' ? '切換亮色' : '切換暗色'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="game-container">
        {mode === 'menu' && (
          <ModeSelector 
            onSelectMode={setMode} 
            stats={stats} 
            onOpenRules={() => setIsRulesOpen(true)} 
          />
        )}
        {mode === 'single' && (
          <SinglePlayer 
            onBackToMenu={() => setMode('menu')} 
            onWin={() => {
              updateStats('singleWins');
              updateStats('singleTotal');
            }}
            onGameOver={() => {
              updateStats('singleTotal');
            }}
          />
        )}
        {mode === 'multi' && (
          <Multiplayer 
            onBackToMenu={() => setMode('menu')} 
            onWin={() => {
              updateStats('multiWins');
              updateStats('multiTotal');
            }}
            onLose={() => {
              updateStats('multiTotal');
            }}
          />
        )}
      </main>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
