import { useEffect, useRef } from 'react';

export interface GuessItem {
  guess: string;
  result: string;
  a?: number;
  b?: number;
}

interface HistoryListProps {
  guesses: GuessItem[];
  title?: string;
  opponentMode?: boolean;
}

export default function HistoryList({ guesses, title = '猜測記錄', opponentMode = false }: HistoryListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when guesses update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [guesses]);

  // Helper to extract A and B counts from result string, e.g. "1A2B" -> { a: 1, b: 2 }
  const parseAB = (result: string) => {
    const match = result.match(/(\d+)A(\d+)B/);
    if (match) {
      return { a: parseInt(match[1]), b: parseInt(match[2]) };
    }
    return { a: 0, b: 0 };
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '350px',
        width: '100%',
        background: opponentMode ? 'rgba(59, 130, 246, 0.02)' : 'rgba(255, 255, 255, 0.01)',
      }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: opponentMode ? 'var(--accent-secondary)' : 'var(--text-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--panel-border)',
          paddingBottom: '8px',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          已猜 {guesses.length} 次
        </span>
      </h3>

      {/* History content */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px',
        }}
      >
        {guesses.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}
          >
            暫無記錄，開始猜測吧！
          </div>
        ) : (
          guesses.map((item, idx) => {
            const { a, b } = parseAB(item.result);
            const isLast = idx === guesses.length - 1;

            return (
              <div
                key={idx}
                className="animate-slide-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isLast 
                    ? (opponentMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(139, 92, 246, 0.12)')
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isLast 
                    ? `1px solid ${opponentMode ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`
                    : '1px solid transparent',
                  borderRadius: '12px',
                  boxShadow: isLast ? 'var(--shadow-glow)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Index */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, width: '32px' }}>
                  #{idx + 1}
                </div>

                {/* Guess Digit String */}
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    fontFamily: 'Outfit, sans-serif',
                    color: 'var(--text-primary)',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  {item.guess}
                </div>

                {/* A / B score badge */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {/* A score block */}
                  <div
                    style={{
                      background: a > 0 ? 'var(--status-success)' : 'rgba(255, 255, 255, 0.05)',
                      color: a > 0 ? '#ffffff' : 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      fontFamily: 'Outfit, sans-serif',
                      minWidth: '32px',
                      textAlign: 'center',
                      boxShadow: a === 4 ? '0 0 12px var(--status-success)' : 'none',
                    }}
                  >
                    {a}A
                  </div>
                  {/* B score block */}
                  <div
                    style={{
                      background: b > 0 ? 'var(--status-warning)' : 'rgba(255, 255, 255, 0.05)',
                      color: b > 0 ? '#ffffff' : 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      fontFamily: 'Outfit, sans-serif',
                      minWidth: '32px',
                      textAlign: 'center',
                    }}
                  >
                    {b}B
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
