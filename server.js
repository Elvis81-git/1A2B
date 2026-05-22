import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Serve static files from Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Game state management
const rooms = {};
let matchmakingQueue = [];

// Helper function to generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O, 0, I, 1
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]); // Ensure uniqueness
  return code;
}

// 1A2B scorer
function calculateAB(secret, guess) {
  let A = 0;
  let B = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      A++;
    } else if (secret.includes(guess[i])) {
      B++;
    }
  }
  return { A, B };
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create room
  socket.on('create_room', ({ nickname }) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      code: roomCode,
      players: [
        {
          id: socket.id,
          nickname: nickname || '玩家 1',
          secret: '',
          guesses: [],
          isReady: false,
        },
      ],
      status: 'waiting', // waiting, setup, playing, finished
      winnerId: null,
    };

    socket.join(roomCode);
    socket.emit('room_created', {
      roomCode,
      players: rooms[roomCode].players.map(p => ({ id: p.id, nickname: p.nickname })),
    });
    console.log(`Room ${roomCode} created by ${nickname}`);
  });

  // Join room
  socket.on('join_room', ({ roomCode, nickname }) => {
    const code = roomCode.trim().toUpperCase();
    const room = rooms[code];

    if (!room) {
      socket.emit('error_message', { message: '找不到該房間號碼，請確認是否輸入正確。' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error_message', { message: '該房間已滿（最多 2 人）。' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('error_message', { message: '該房間的遊戲已經開始。' });
      return;
    }

    const newPlayer = {
      id: socket.id,
      nickname: nickname || '玩家 2',
      secret: '',
      guesses: [],
      isReady: false,
    };

    room.players.push(newPlayer);
    room.status = 'setup'; // Switch to setup phase when both are in

    socket.join(code);
    
    // Notify the joiner
    socket.emit('room_joined', {
      roomCode: code,
      players: room.players.map(p => ({ id: p.id, nickname: p.nickname })),
      status: room.status,
    });

    // Notify the host
    socket.to(code).emit('player_joined', {
      players: room.players.map(p => ({ id: p.id, nickname: p.nickname })),
      status: room.status,
    });

    console.log(`User ${nickname} joined room ${code}`);
  });

  // Matchmaking (random join)
  socket.on('find_match', ({ nickname }) => {
    // Remove if already in queue
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);

    // If another player is waiting in the queue
    if (matchmakingQueue.length > 0) {
      const opponent = matchmakingQueue.shift();
      const opponentSocket = io.sockets.sockets.get(opponent.socketId);

      if (opponentSocket) {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
          code: roomCode,
          players: [
            {
              id: opponent.socketId,
              nickname: opponent.nickname,
              secret: '',
              guesses: [],
              isReady: false,
            },
            {
              id: socket.id,
              nickname: nickname || '玩家 2',
              secret: '',
              guesses: [],
              isReady: false,
            },
          ],
          status: 'setup',
          winnerId: null,
        };

        opponentSocket.join(roomCode);
        socket.join(roomCode);

        const roomData = {
          roomCode,
          players: rooms[roomCode].players.map(p => ({ id: p.id, nickname: p.nickname })),
          status: 'setup',
        };

        opponentSocket.emit('match_found', roomData);
        socket.emit('match_found', roomData);

        console.log(`Matchmaking succeeded: Room ${roomCode} created for ${opponent.nickname} and ${nickname}`);
        return;
      }
    }

    // Otherwise, push self to matchmaking queue
    matchmakingQueue.push({ socketId: socket.id, nickname });
    socket.emit('matchmaking_queued');
    console.log(`User ${nickname} entered matchmaking queue.`);
  });

  // Cancel Matchmaking
  socket.on('cancel_matchmaking', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    socket.emit('matchmaking_cancelled');
    console.log(`User ${socket.id} cancelled matchmaking.`);
  });

  // Submit Secret Number
  socket.on('submit_secret', ({ roomCode, secret }) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Validate secret is 4 unique digits
    if (!/^\d{4}$/.test(secret) || new Set(secret).size !== 4) {
      socket.emit('error_message', { message: '設定失敗！必須是 4 個不重複的數字。' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.secret = secret;
    player.isReady = true;

    // Notify room that this player is ready
    io.to(roomCode).emit('player_ready', { playerId: socket.id });

    // Check if both players are ready
    const allReady = room.players.length === 2 && room.players.every(p => p.isReady);
    if (allReady) {
      room.status = 'playing';
      io.to(roomCode).emit('game_start', { status: room.status });
      console.log(`Game started in room ${roomCode}`);
    }
  });

  // Submit Guess
  socket.on('submit_guess', ({ roomCode, guess }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'playing') return;

    // Find the current player and opponent
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const player = room.players[playerIndex];
    const opponent = room.players[opponentIndex];

    if (!opponent || !opponent.secret) {
      socket.emit('error_message', { message: '對手尚未準備就緒或尚未設定謎底。' });
      return;
    }

    // Validate guess is 4 unique digits
    if (!/^\d{4}$/.test(guess) || new Set(guess).size !== 4) {
      socket.emit('error_message', { message: '輸入無效！請輸入 4 個不重複的數字。' });
      return;
    }

    // Calculate score against opponent's secret
    const result = calculateAB(opponent.secret, guess);
    const guessEntry = {
      guess,
      result: `${result.A}A${result.B}`,
      a: result.A,
      b: result.B,
      timestamp: Date.now(),
    };

    player.guesses.push(guessEntry);

    // Send result to the guesser
    socket.emit('guess_result', {
      guesses: player.guesses,
      lastResult: guessEntry,
    });

    // Notify the opponent of the player's progress (showing the digits is fine, it displays the battle history!)
    socket.to(roomCode).emit('opponent_guessed', {
      guess: guessEntry.guess,
      result: guessEntry.result,
      totalGuesses: player.guesses.length,
      bestResult: getBestResult(player.guesses),
    });

    // Check win condition
    if (result.A === 4) {
      room.status = 'finished';
      room.winnerId = socket.id;
      io.to(roomCode).emit('game_over', {
        winnerId: socket.id,
        winnerName: player.nickname,
        opponentSecret: opponent.secret,
        playerSecret: player.secret,
      });
      console.log(`Game over in room ${roomCode}. Winner: ${player.nickname}`);
    }
  });

  // Chat message
  socket.on('send_chat', ({ roomCode, message }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const sender = room.players.find(p => p.id === socket.id);
    if (!sender) return;

    io.to(roomCode).emit('chat_message', {
      senderId: socket.id,
      senderName: sender.nickname,
      message,
      timestamp: Date.now(),
    });
  });

  // Disconnect / Leave
  const handleLeave = () => {
    // Remove from matchmaking queue
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);

    // Check if in any active rooms
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        
        // Remove player
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          // No one left, delete room
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted as all players left.`);
        } else {
          // Opponent remains
          room.status = 'waiting';
          io.to(roomCode).emit('opponent_left', {
            message: `${player.nickname} 已經離開了房間。`,
          });
          console.log(`Player ${player.nickname} left room ${roomCode}. Room reset to waiting.`);
        }
      }
    }
  };

  socket.on('leave_room', handleLeave);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleLeave();
  });
});

// Helper to determine the best guess result (prioritize A then B)
function getBestResult(guesses) {
  if (guesses.length === 0) return '0A0B';
  let best = guesses[0];
  for (const g of guesses) {
    if (g.a > best.a || (g.a === best.a && g.b > best.b)) {
      best = g;
    }
  }
  return best.result;
}

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
