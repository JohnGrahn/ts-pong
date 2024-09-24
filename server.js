import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Initialize Express app and middleware
const app = express();
app.use(cors());
// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;
// Serve static files from the 'dist' directory
const staticPath = path.join(__dirname, 'dist');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});
// Class to manage game rooms
class RoomManager {
    constructor() {
        this.gameRooms = new Map();
    }
    findAvailableRoom() {
        for (const room of this.gameRooms.values()) {
            if (room.players.length < 2) {
                return room;
            }
        }
        return null;
    }
    createRoom() {
        const roomId = `room_${Date.now()}`;
        const newRoom = {
            roomId,
            players: [],
            ballPosition: { x: 400, y: 300 },
            scores: { player1: 0, player2: 0 },
            lastScoredAt: 0,
        };
        this.gameRooms.set(roomId, newRoom);
        return newRoom;
    }
    addPlayerToRoom(socket, room) {
        room.players.push(socket);
        socket.join(room.roomId);
    }
    removePlayerFromRoom(socket) {
        for (const [roomId, room] of this.gameRooms.entries()) {
            const index = room.players.indexOf(socket);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (room.players.length === 0) {
                    this.gameRooms.delete(roomId);
                }
                else {
                    io.to(roomId).emit('opponentDisconnected');
                }
                break;
            }
        }
    }
    getRoom(roomId) {
        return this.gameRooms.get(roomId);
    }
    removeRoom(roomId) {
        const room = this.gameRooms.get(roomId);
        if (room) {
            // Notify remaining players (if any) about the room removal
            io.to(roomId).emit('roomRemoved');
            // Leave all sockets from the room
            room.players.forEach(socket => {
                socket.leave(roomId);
            });
            // Delete the room from the map
            this.gameRooms.delete(roomId);
            console.log(`Room ${roomId} has been removed.`);
        }
        else {
            console.warn(`Attempted to remove non-existent room: ${roomId}`);
        }
    }
}
const roomManager = new RoomManager();
// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Handle joining a game
    socket.on('joinGame', () => {
        let room = roomManager.findAvailableRoom();
        if (!room) {
            room = roomManager.createRoom();
        }
        roomManager.addPlayerToRoom(socket, room);
        console.log(`Socket ${socket.id} joined room ${room.roomId}`);
        if (room.players.length === 1) {
            socket.emit('waitingForOpponent');
        }
        else if (room.players.length === 2) {
            io.to(room.roomId).emit('gameStart', {
                roomId: room.roomId,
                players: room.players.map(p => p.id)
            });
        }
    });
    // Handle collision events
    socket.on('collision', (data) => {
        const room = roomManager.getRoom(data.roomId);
        if (!room)
            return;
        const [player1] = room.players;
        if (socket.id !== player1.id) {
            console.log(`Collision event from non-authoritative socket ${socket.id} ignored.`);
            return;
        }
        const now = Date.now();
        if (now - room.lastScoredAt < 1000) {
            console.log('Duplicate collision event ignored.');
            return;
        }
        room.lastScoredAt = now;
        if (data.scorer === 'player') {
            room.scores.player1++;
            console.log(`Player 1 scored. New score: ${room.scores.player1} - ${room.scores.player2}`);
        }
        else {
            room.scores.player2++;
            console.log(`Player 2 scored. New score: ${room.scores.player1} - ${room.scores.player2}`);
        }
        io.to(room.roomId).emit('scoreUpdate', room.scores);
        // Check for game over
        if (room.scores.player1 >= 5 || room.scores.player2 >= 5) {
            const winner = room.scores.player1 > room.scores.player2 ? 'Player 1' : 'Player 2';
            io.to(room.roomId).emit('gameOver', { winner, scores: room.scores });
            // Remove the room after the game is over
            roomManager.removeRoom(room.roomId);
        }
    });
    // Handle paddle movement
    socket.on('paddleMove', (data) => {
        socket.to(data.roomId).emit('opponentPaddleMove', { normalizedY: data.normalizedY });
    });
    // Handle ball movement
    socket.on('ballMove', (data) => {
        const room = roomManager.getRoom(data.roomId);
        if (room) {
            room.ballPosition = { x: data.x, y: data.y };
            socket.to(data.roomId).emit('ballUpdate', { x: data.x, y: data.y });
        }
    });
    // Handle ball reset
    socket.on('ballReset', (data) => {
        const room = roomManager.getRoom(data.roomId);
        if (room) {
            room.ballPosition = { x: data.x, y: data.y };
            socket.to(data.roomId).emit('ballReset', { x: data.x, y: data.y });
        }
    });
    // Handle score updates
    socket.on('updateScore', (data) => {
        const room = roomManager.getRoom(data.roomId);
        if (room) {
            room.scores = { player1: data.player1, player2: data.player2 };
            io.to(data.roomId).emit('scoreUpdate', room.scores);
        }
    });
    // Handle goal scored
    socket.on('goalScored', (data) => {
        const room = roomManager.getRoom(data.roomId);
        if (room) {
            if (data.scorer === 'player') {
                room.scores.player1++;
            }
            else {
                room.scores.player2++;
            }
            io.to(data.roomId).emit('scoreUpdate', room.scores);
        }
    });
    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        roomManager.removePlayerFromRoom(socket);
    });
});
// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
