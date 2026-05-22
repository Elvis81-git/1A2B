import { useState, useEffect, useRef } from 'react';
import { 
  Users, Copy, Check, MessageSquare, Play, Send, LogOut, ArrowRight,
  Shield, HelpCircle, User, Loader2, Award, Flame, RefreshCw, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSocket, ChatMessage } from '../hooks/useSocket';
import GameBoard from './GameBoard';
import HistoryList from './HistoryList';

interface MultiplayerProps {
  onBackToMenu: () => void;
  onWin: () => void;
  onLose: () => void;
}

export default function Multiplayer({ onBackToMenu, onWin, onLose }: MultiplayerProps) {
  const {
    isConnected,
    error,
    clearError,
    roomCode,
    players,
    gameState,
    readyPlayers,
    guesses,
    opponentGuesses,
    winnerInfo,
    opponentSecret,
    playerSecret,
    chatMessages,
    matchmakingStatus,
    myId,
    connect,
    disconnect,
    submitSecret,
    submitGuess,
    sendChat,
    cancelMatchmaking,
  } = useSocket();

  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('1a2b_nickname') || '';
  });
  const [joinCode, setJoinCode] = useState<string>('');
  const [inputSecret, setInputSecret] = useState<string>('');
  const [isSecretSet, setIsSecretSet] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  // Handle Win/Lose callback to parent stats
  useEffect(() => {
    if (gameState === 'finished' && winnerInfo) {
      if (winnerInfo.id === myId) {
        onWin();
        // Fire celebration
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        onLose();
      }
    }
  }, [gameState, winnerInfo, myId]);

  // Save nickname on change
  const handleSaveNickname = (name: string) => {
    const trimmed = name.trim().slice(0, 10);
    setNickname(trimmed);
    localStorage.setItem('1a2b_nickname', trimmed);
  };

  // Copy room code to clipboard
  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Create room
  const handleCreateRoom = () => {
    if (!nickname.trim()) return;
    connect(nickname, 'create');
  };

  // Join room
  const handleJoinRoom = () => {
    if (!nickname.trim() || !joinCode.trim()) return;
    connect(nickname, 'join', joinCode.trim().toUpperCase());
  };

  // Matchmaking
  const handleStartMatchmaking = () => {
    if (!nickname.trim()) return;
    connect(nickname, 'match');
  };

  // Handle Send Chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  // Handle Submit Secret Number
  const handleSecretSubmit = (secret: string) => {
    submitSecret(secret);
    setIsSecretSet(true);
  };

  // Opponent reference
  const opponent = players.find(p => p.id !== myId);
  const me = players.find(p => p.id === myId);

  // If not connected / idle, show Entrance Lobby
  if (gameState === 'idle' && matchmakingStatus === 'idle') {
    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'slideInUp 0.4s ease-out',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            🎮 線上對戰大廳
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            設定暱稱並與朋友連線，或是挑戰隨機對手！
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--status-danger)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button onClick={clearError} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Nickname input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            您的暱稱
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-text"
              placeholder="輸入您的玩家名稱..."
              value={nickname}
              onChange={(e) => handleSaveNickname(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '0.5rem' }}>
          <button
            className="btn btn-primary"
            disabled={!nickname.trim()}
            onClick={handleStartMatchmaking}
            style={{ padding: '14px 24px', background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #06b6d4 100%)', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)' }}
          >
            ⚡ 隨機快速配對
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              disabled={!nickname.trim()}
              onClick={handleCreateRoom}
            >
              建立房間
            </button>
            <button
              className="btn btn-secondary"
              disabled={!nickname.trim()}
              onClick={handleCreateRoom} // Just show direct join input below
              style={{ pointerEvents: 'none', opacity: 0.3 }}
            >
              加入好友
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>輸入房間號碼加入</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input-text"
            placeholder="請輸入 4 位房號..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold' }}
          />
          <button
            className="btn btn-primary"
            disabled={!nickname.trim() || joinCode.length < 4}
            onClick={handleJoinRoom}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Matchmaking Queue status
  if (matchmakingStatus === 'queued') {
    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'slideInUp 0.4s ease-out',
        }}
      >
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-secondary)' }} />
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>正在配對對手...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            請稍後，系統正在為您尋找其他在線玩家。
          </p>
        </div>
        <button className="btn btn-secondary" onClick={cancelMatchmaking} style={{ width: '100%', marginTop: '0.5rem' }}>
          取消配對
        </button>
      </div>
    );
  }

  // Room waiting stage (Waiting for 2nd Player)
  if (gameState === 'waiting') {
    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'slideInUp 0.4s ease-out',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>等待對手加入...</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            將下面的房間代碼分享給您的好友，讓他們加入對決。
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Room Code Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '2px dashed var(--panel-border)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>房間號碼</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '4px', marginTop: '2px', fontFamily: 'Outfit, sans-serif' }}>
              {roomCode}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleCopyCode} style={{ padding: '12px' }}>
            {copied ? <Check size={18} style={{ color: 'var(--status-success)' }} /> : <Copy size={18} />}
          </button>
        </div>

        {/* Player List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>房間成員</div>
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="glass-panel"
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.95rem',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)' }}></div>
              <strong>{p.nickname}</strong>
              {p.id === myId && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(您)</span>}
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {idx === 0 ? '房主' : '玩家'}
              </span>
            </div>
          ))}
          
          {players.length < 2 && (
            <div
              className="glass-panel"
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed var(--panel-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              <Loader2 size={14} className="animate-spin" />
              <span>等待對手連線中...</span>
            </div>
          )}
        </div>

        <button className="btn btn-secondary" onClick={disconnect} style={{ width: '100%', marginTop: '0.5rem' }}>
          離開房間
        </button>
      </div>
    );
  }

  // Setup Secret number Phase
  if (gameState === 'setup') {
    const isOpponentReady = readyPlayers.has(opponent?.id || '');
    const isMeReady = readyPlayers.has(myId);

    return (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'slideInUp 0.4s ease-out',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>🔑 設定你的謎底</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            設定一個 4 位數（不重複）的秘密數字供對手猜測。
          </p>
        </div>

        {/* Players Status Card */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '10px',
              textAlign: 'center',
              background: isMeReady ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
              borderColor: isMeReady ? 'var(--status-success)' : 'var(--panel-border)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>您的狀態</div>
            <strong style={{ fontSize: '0.9rem', color: isMeReady ? 'var(--status-success)' : 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
              {isMeReady ? '準備就緒' : '設定密碼中...'}
            </strong>
          </div>
          <div
            className="glass-panel"
            style={{
              padding: '10px',
              textAlign: 'center',
              background: isOpponentReady ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
              borderColor: isOpponentReady ? 'var(--status-success)' : 'var(--panel-border)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>對手 ({opponent?.nickname})</div>
            <strong style={{ fontSize: '0.9rem', color: isOpponentReady ? 'var(--status-success)' : 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
              {isOpponentReady ? '準備就緒' : '思考中...'}
            </strong>
          </div>
        </div>

        {/* Digit Board for submitting secret */}
        <GameBoard
          onSubmit={handleSecretSubmit}
          disabled={isMeReady}
          label="請輸入您的秘密防守數字"
          placeholder="確定秘密數字"
        />

        {isMeReady && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Loader2 size={14} className="animate-spin" />
            <span>正在等待對手設定謎底...</span>
          </div>
        )}

        <button className="btn btn-secondary" onClick={disconnect} style={{ width: '100%', marginTop: '0.5rem' }}>
          離開房間
        </button>
      </div>
    );
  }

  // Active game race mode (Playing)
  if (gameState === 'playing') {
    const oppGuessesCount = opponentGuesses.length;
    const oppBestResult = opponentGuesses.length > 0 ? opponentGuesses[opponentGuesses.length - 1].bestResult : '0A0B';
    const oppLastGuess = opponentGuesses.length > 0 ? opponentGuesses[opponentGuesses.length - 1].guess : '無';
    const oppLastResult = opponentGuesses.length > 0 ? opponentGuesses[opponentGuesses.length - 1].result : '無';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1100px',
          animation: 'slideInUp 0.4s ease-out',
        }}
      >
        {/* Battle status info bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            gap: '10px',
          }}
        >
          {/* Your Info */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>玩家 (攻方)</div>
            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{me?.nickname}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
              己方守城密碼: <strong style={{ color: 'var(--text-primary)' }}>{playerSecret}</strong>
            </span>
          </div>

          {/* VS Center Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 900,
              padding: '6px 12px',
              borderRadius: '99px',
              boxShadow: '0 0 15px var(--accent-primary-glow)',
            }}
          >
            BATTLE
          </div>

          {/* Opponent Info */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>對手 (守方)</div>
            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>{opponent?.nickname}</strong>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="battle-arena">
          {/* Left panel: Your board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GameBoard onSubmit={submitGuess} label="破解對手的謎底" />
            </div>
            <HistoryList guesses={guesses} title="您的猜測歷史" />
          </div>

          {/* Right panel: Opponent board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Opponent live status */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                height: '243px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> 對手即時動態
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                <div className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>猜測次數</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', fontFamily: 'Outfit, sans-serif' }}>
                    {oppGuessesCount}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>最佳成績</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--status-warning)', fontFamily: 'Outfit, sans-serif' }}>
                    {oppBestResult}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.1)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>對手最後一次猜測</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px', fontFamily: 'Outfit' }}>{oppLastGuess}</span>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: oppLastResult.includes('A') ? 'var(--status-success)' : 'var(--text-muted)',
                      }}
                    >
                      {oppLastResult}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconstructed Opponent guesses feed */}
            <HistoryList
              guesses={opponentGuesses.map(o => ({ guess: o.guess, result: o.result }))}
              title={`${opponent?.nickname || '對手'} 的猜測歷史`}
              opponentMode={true}
            />
          </div>
        </div>

        {/* Bottom Social Box: Chat & Leave Option */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowChat(!showChat)}
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <MessageSquare size={14} /> {showChat ? '隱藏聊天室' : `對局聊天室 (${chatMessages.length})`}
            </button>

            <button
              className="btn btn-secondary"
              onClick={disconnect}
              style={{ fontSize: '0.85rem', padding: '6px 12px', color: 'var(--status-danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
            >
              <LogOut size={14} /> 認輸退出
            </button>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div
              className="glass-panel animate-slide-up"
              style={{
                padding: '10px',
                background: 'rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                height: '200px',
              }}
            >
              {/* Message scroll log */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px',
                  marginBottom: '10px',
                }}
              >
                {chatMessages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    開始說點什麼吧！
                  </div>
                ) : (
                  chatMessages.map((c, idx) => {
                    const isMyMsg = c.senderId === myId;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMyMsg ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          alignSelf: isMyMsg ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          {isMyMsg ? '您' : c.senderName}
                        </span>
                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            background: isMyMsg ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            fontSize: '0.85rem',
                            wordBreak: 'break-word',
                          }}
                        >
                          {c.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder="輸入訊息..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game Finished Mode (Finished overlay)
  if (gameState === 'finished' && winnerInfo) {
    const isWinner = winnerInfo.id === myId;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
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
            maxWidth: '450px',
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: isWinner ? '0 25px 60px rgba(16, 185, 129, 0.2)' : '0 25px 60px rgba(239, 68, 68, 0.2)',
            border: `1px solid ${isWinner ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            animation: 'scaleInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: isWinner ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isWinner ? 'var(--status-success)' : 'var(--status-danger)',
              marginBottom: '0.5rem',
            }}
          >
            <Award size={40} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: isWinner ? 'var(--status-success)' : 'var(--status-danger)' }}>
              {isWinner ? '🏆 您贏得了勝利！' : '💀 敗北...'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {isWinner 
                ? `恭喜您！先於對手破解了對方的守城密碼！`
                : `對手 ${winnerInfo.name} 率先解開了您的秘密防線！`}
            </p>
          </div>

          {/* Reveal Secrets Card */}
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
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>對手密碼 ({opponent?.nickname})</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-secondary)', letterSpacing: '3px', marginTop: '4px' }}>
                {opponentSecret}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--panel-border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>您的密碼 ({me?.nickname})</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '3px', marginTop: '4px' }}>
                {playerSecret}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--panel-border)', gridColumn: 'span 2', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>您猜了: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{guesses.length} 次</strong>
              </div>
              <div style={{ borderLeft: '1px solid var(--panel-border)', paddingLeft: '20px' }}>
                <span style={{ color: 'var(--text-muted)' }}>對手猜了: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{opponentGuesses.length} 次</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={disconnect}
          >
            返回大廳
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
