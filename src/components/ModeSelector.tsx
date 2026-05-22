import { Gamepad2, Users, Trophy, Play, HelpCircle } from 'lucide-react';
import { GameMode } from '../App';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  stats: {
    singleWins: 0 | number;
    singleTotal: 0 | number;
    multiWins: 0 | number;
    multiTotal: 0 | number;
  };
  onOpenRules: () => void;
}

export default function ModeSelector({ onSelectMode, stats, onOpenRules }: ModeSelectorProps) {
  const singleWinRate = stats.singleTotal > 0 ? Math.round((stats.singleWins / stats.singleTotal) * 100) : 0;
  const multiWinRate = stats.multiTotal > 0 ? Math.round((stats.multiWins / stats.multiTotal) * 100) : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '800px',
        animation: 'slideInUp 0.5s ease-out',
      }}
    >
      {/* Title Hero */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
          解開密碼，贏得勝利！
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
          經典的 1A2B 益智解謎遊戲。現在你可以自己練習，或者透過 Render 與全球玩家進行線上即時競速！
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Single Player Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, var(--card-glow-left) 0%, rgba(18,14,38,0.45) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Gamepad2 size={24} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OFFLINE</div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>單人練習模式</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              挑戰在最少次數與最短時間內猜中電腦隨機生成的 4 位數字謎底。適合鍛鍊邏輯思維與排錯技巧！
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => onSelectMode('single')}>
            <Play size={16} fill="currentColor" /> 開始練習
          </button>
        </div>

        {/* Multiplayer Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(18,14,38,0.45) 0%, var(--card-glow-right) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--accent-secondary)' }}>
              <Users size={24} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>ONLINE</div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>即時連線對戰</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              建立房間與好友連線對戰，或者隨機匹配在線對手。雙方各自設定謎底，比誰先破解對手的數字！
            </p>
          </div>

          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #06b6d4 100%)', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)' }} onClick={() => onSelectMode('multi')}>
            <Users size={16} /> 進入連線大廳
          </button>
        </div>
      </div>

      {/* Stats and Help Footer Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Statistics Board */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy size={28} style={{ color: 'var(--status-warning)' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>單人戰績</div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '2px' }}>
                {stats.singleWins}/{stats.singleTotal} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({singleWinRate}%)</span>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--panel-border)', paddingLeft: '1rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>連線戰績</div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '2px' }}>
                {stats.multiWins}/{stats.multiTotal} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({multiWinRate}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Rules Card */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer'
          }}
          onClick={onOpenRules}
        >
          <HelpCircle size={28} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>還不清楚規則嗎？</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>點擊此處查看詳細的 A 與 B 判定範例說明</div>
          </div>
        </div>
      </div>
    </div>
  );
}
