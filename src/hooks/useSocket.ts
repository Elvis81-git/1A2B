import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  nickname: string;
}

export interface GuessEntry {
  guess: string;
  result: string;
  a: number;
  b: number;
  timestamp: number;
}

export interface OpponentProgress {
  guess: string;
  result: string;
  totalGuesses: number;
  bestResult: string;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'setup' | 'playing' | 'finished'>('idle');
  const [readyPlayers, setReadyPlayers] = useState<Set<string>>(new Set());
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [opponentGuesses, setOpponentGuesses] = useState<OpponentProgress[]>([]);
  const [winnerInfo, setWinnerInfo] = useState<{ id: string; name: string } | null>(null);
  const [opponentSecret, setOpponentSecret] = useState<string | null>(null);
  const [playerSecret, setPlayerSecret] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'queued'>('idle');

  // Disconnect socket helper
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    // Reset state
    setIsConnected(false);
    setError(null);
    setRoomCode(null);
    setPlayers([]);
    setGameState('idle');
    setReadyPlayers(new Set());
    setGuesses([]);
    setOpponentGuesses([]);
    setWinnerInfo(null);
    setOpponentSecret(null);
    setPlayerSecret(null);
    setChatMessages([]);
    setMatchmakingStatus('idle');
  }, []);

  // Connect and initialize listeners
  const connect = useCallback((nickname: string, actionType: 'create' | 'join' | 'match', targetCode?: string) => {
    disconnect(); // Ensure clean slate before connecting

    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 3,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);

      // Perform action once connected
      if (actionType === 'create') {
        socket.emit('create_room', { nickname });
      } else if (actionType === 'join' && targetCode) {
        socket.emit('join_room', { roomCode: targetCode, nickname });
      } else if (actionType === 'match') {
        socket.emit('find_match', { nickname });
      }
    });

    socket.on('connect_error', () => {
      setError('連線至伺服器失敗，請確認伺服器是否開啟。');
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Room created / joined
    socket.on('room_created', ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState('waiting');
    });

    socket.on('room_joined', ({ roomCode, players, status }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState(status);
    });

    socket.on('player_joined', ({ players, status }) => {
      setPlayers(players);
      setGameState(status);
    });

    // Matchmaking queue
    socket.on('matchmaking_queued', () => {
      setMatchmakingStatus('queued');
    });

    socket.on('matchmaking_cancelled', () => {
      setMatchmakingStatus('idle');
      disconnect();
    });

    socket.on('match_found', ({ roomCode, players, status }) => {
      setMatchmakingStatus('idle');
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState(status);
    });

    // Player ready
    socket.on('player_ready', ({ playerId }) => {
      setReadyPlayers(prev => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
    });

    // Game starts
    socket.on('game_start', ({ status }) => {
      setGameState(status);
    });

    // Guess result for current player
    socket.on('guess_result', ({ guesses }) => {
      setGuesses(guesses);
    });

    // Opponent made a guess
    socket.on('opponent_guessed', (oppGuess: OpponentProgress) => {
      setOpponentGuesses(prev => [...prev, oppGuess]);
    });

    // Chat Message
    socket.on('chat_message', (chat: ChatMessage) => {
      setChatMessages(prev => [...prev, chat]);
    });

    // Error messages from server
    socket.on('error_message', ({ message }) => {
      setError(message);
      if (gameState === 'idle') {
        disconnect();
      }
    });

    // Opponent left
    socket.on('opponent_left', ({ message }) => {
      setError(message);
      setGameState('waiting');
      setReadyPlayers(new Set());
      setGuesses([]);
      setOpponentGuesses([]);
      setWinnerInfo(null);
      setOpponentSecret(null);
      setPlayerSecret(null);
    });

    // Game Over
    socket.on('game_over', ({ winnerId, winnerName, opponentSecret, playerSecret }) => {
      setGameState('finished');
      setWinnerInfo({ id: winnerId, name: winnerName });
      setOpponentSecret(opponentSecret);
      setPlayerSecret(playerSecret);
    });

    socket.connect();
  }, [disconnect, gameState]);

  // Submit Secret Number
  const submitSecret = useCallback((secret: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('submit_secret', { roomCode, secret });
    }
  }, [roomCode]);

  // Submit Guess
  const submitGuess = useCallback((guess: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('submit_guess', { roomCode, guess });
    }
  }, [roomCode]);

  // Send Chat Message
  const sendChat = useCallback((message: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('send_chat', { roomCode, message });
    }
  }, [roomCode]);

  // Cancel Matchmaking
  const cancelMatchmaking = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('cancel_matchmaking');
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const clearError = () => setError(null);

  const getMyId = () => socketRef.current?.id || '';

  return {
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
    myId: getMyId(),
    connect,
    disconnect,
    submitSecret,
    submitGuess,
    sendChat,
    cancelMatchmaking,
  };
}
