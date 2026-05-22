import { X, CheckCircle, Info } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-secondary animate-slide-up"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            padding: '8px',
            borderRadius: '50%',
          }}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          🎮 遊戲玩法與規則
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <div>
            1A2B（又稱 Bulls and Cows）是一個經典的猜數字智力遊戲。玩家需要在有限或無限次數中猜出對方的 4 位謎底數字。
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />
              核心規則：
            </h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>數字不重複：</strong> 謎底與您輸入的猜測都必須是 <strong>4 個不重複的數字 (0-9)</strong>。</li>
              <li><strong>A 的定義：</strong> 數值正確，且<strong>位置完全正確</strong>。</li>
              <li><strong>B 的定義：</strong> 數值正確，但<strong>位置不正確</strong>。</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} style={{ color: 'var(--accent-secondary)' }} />
              範例說明：
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              假設謎底為 <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', letterSpacing: '1px' }}>1 2 3 4</strong>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.25rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>您的猜測</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>獲得判定</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>原因</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>1 5 6 7</td>
                  <td style={{ padding: '12px 4px', color: 'var(--status-success)', fontWeight: 'bold' }}>1A0B</td>
                  <td style={{ padding: '12px 4px', fontSize: '0.85rem' }}>「1」數值及位置皆正確。</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>5 4 3 2</td>
                  <td style={{ padding: '12px 4px', color: 'var(--status-warning)', fontWeight: 'bold' }}>1A2B</td>
                  <td style={{ padding: '12px 4px', fontSize: '0.85rem' }}>「3」位置正確。「4」與「2」存在但位置錯。</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>4 3 2 1</td>
                  <td style={{ padding: '12px 4px', color: 'var(--status-warning)', fontWeight: 'bold' }}>0A4B</td>
                  <td style={{ padding: '12px 4px', fontSize: '0.85rem' }}>4 個數字都對，但全部位置都錯。</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>1 2 3 4</td>
                  <td style={{ padding: '12px 4px', color: 'var(--status-success)', fontWeight: 'bold' }}>4A0B</td>
                  <td style={{ padding: '12px 4px', fontSize: '0.85rem' }}>完全答對，解鎖獲勝！</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={onClose}>
          我知道了，開始挑戰
        </button>
      </div>
    </div>
  );
}
