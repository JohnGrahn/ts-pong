import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

console.log('Serving static files from:', path.join(__dirname, 'dist'));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

interface GameRoom {
  players: Socket[];
  ballPosition: { x: number; y: number };
  scores: { player1: number; player2: number };
  lastScoredAt: number; // Initialize this in the constructor
}

const gameRooms: Map<string, GameRoom> = new Map();

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  socket.on('joinGame', () => {
    let roomToJoin: string | null = null;

    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.length < 2) {
        roomToJoin = roomId;
        break;
      }
    }

    if (!roomToJoin) {
      roomToJoin = `room_${Date.now()}`;
      gameRooms.set(roomToJoin, {
        players: [],
        ballPosition: { x: 400, y: 300 },
        scores: { player1: 0, player2: 0 },
        lastScoredAt: 0, // Initialize
      });
    }

    const room = gameRooms.get(roomToJoin)!;
    room.players.push(socket);
    socket.join(roomToJoin);

    if (room.players.length === 2) {
      io.to(roomToJoin).emit('gameStart', { roomId: roomToJoin, players: room.players.map(p => p.id) });
    }

    socket.emit('waitingForOpponent');
  });

  socket.on('collision', (data: { roomId: string; scorer: 'player' | 'ai' }) => {
    const room = gameRooms.get(data.roomId);
    if (room) {
        // Identify Player 1's socket ID
        const player1SocketId = room.players[0].id;

        if (socket.id !== player1SocketId) {
            console.log(`Collision event from non-authoritative socket ${socket.id} ignored.`);
            return;
        }

        const now = Date.now();
        // Prevent processing multiple collisions within 1 second
        if (now - room.lastScoredAt < 1000) {
            console.log('Duplicate collision event ignored.');
            return;
        }
        room.lastScoredAt = now;

        if (data.scorer === 'player') {
            room.scores.player1++;
            console.log(`Player 1 scored. New score: ${room.scores.player1} - ${room.scores.player2}`);
        } else {
            // Assuming 'ai' is replaced with 'player2' in multiplayer
            room.scores.player2++;
            console.log(`Player 2 scored. New score: ${room.scores.player1} - ${room.scores.player2}`);
        }
        io.to(data.roomId).emit('scoreUpdate', room.scores);

        // Check for game over
        if (room.scores.player1 >= 5 || room.scores.player2 >= 5) {
            const winner = room.scores.player1 > room.scores.player2 ? 'Player 1' : 'Player 2';
            io.to(data.roomId).emit('gameOver', { winner, scores: room.scores });
            // Optionally reset or delete the room
        }
    }
  });

  socket.on('paddleMove', (data: { roomId: string; playerId: number; normalizedY: number }) => {
    socket.to(data.roomId).emit('opponentPaddleMove', { normalizedY: data.normalizedY });
  });

  socket.on('ballMove', (data: { roomId: string; x: number; y: number }) => {
    const room = gameRooms.get(data.roomId);
    if (room) {
      room.ballPosition = { x: data.x, y: data.y };
      socket.to(data.roomId).emit('ballUpdate', { x: data.x, y: data.y });
    }
  });

  socket.on('ballReset', (data: { roomId: string; x: number; y: number }) => {
    const room = gameRooms.get(data.roomId);
    if (room) {
      room.ballPosition = { x: data.x, y: data.y };
      socket.to(data.roomId).emit('ballReset', { x: data.x, y: data.y });
    }
  });

  socket.on('updateScore', (data: { roomId: string; player1: number; player2: number }) => {
    const room = gameRooms.get(data.roomId);
    if (room) {
      room.scores = { player1: data.player1, player2: data.player2 };
      io.to(data.roomId).emit('scoreUpdate', room.scores);
    }
  });

  socket.on('goalScored', (data: { roomId: string; scorer: 'player' | 'ai' }) => {
    const room = gameRooms.get(data.roomId);
    if (room) {
      if (data.scorer === 'player') {
        room.scores.player1++;
      } else {
        room.scores.player2++;
      }
      io.to(data.roomId).emit('scoreUpdate', room.scores);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    for (const [roomId, room] of gameRooms.entries()) {
      const index = room.players.indexOf(socket);
      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit('opponentDisconnected');
        }
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});