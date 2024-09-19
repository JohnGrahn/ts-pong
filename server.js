"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var path_1 = require("path");
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(httpServer);
var PORT = process.env.PORT || 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, 'dist')));
var gameRooms = new Map();
io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('joinGame', function () {
        var roomToJoin = null;
        for (var _i = 0, _a = gameRooms.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], roomId = _b[0], room_1 = _b[1];
            if (room_1.players.length < 2) {
                roomToJoin = roomId;
                break;
            }
        }
        if (!roomToJoin) {
            roomToJoin = "room_".concat(Date.now());
            gameRooms.set(roomToJoin, {
                players: [],
                ballPosition: { x: 400, y: 300 },
                scores: { player1: 0, player2: 0 },
            });
        }
        var room = gameRooms.get(roomToJoin);
        room.players.push(socket);
        socket.join(roomToJoin);
        if (room.players.length === 2) {
            io.to(roomToJoin).emit('gameStart', { roomId: roomToJoin, players: room.players.map(function (p) { return p.id; }) });
        }
        socket.emit('waitingForOpponent');
    });
    socket.on('paddleMove', function (data) {
        socket.to(data.roomId).emit('opponentPaddleMove', { y: data.y });
    });
    socket.on('ballMove', function (data) {
        var room = gameRooms.get(data.roomId);
        if (room) {
            room.ballPosition = { x: data.x, y: data.y };
            socket.to(data.roomId).emit('ballUpdate', { x: data.x, y: data.y });
        }
    });
    socket.on('updateScore', function (data) {
        var room = gameRooms.get(data.roomId);
        if (room) {
            room.scores = { player1: data.player1, player2: data.player2 };
            io.to(data.roomId).emit('scoreUpdate', room.scores);
        }
    });
    socket.on('disconnect', function () {
        console.log('A user disconnected');
        for (var _i = 0, _a = gameRooms.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], roomId = _b[0], room = _b[1];
            var index = room.players.indexOf(socket);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (room.players.length === 0) {
                    gameRooms.delete(roomId);
                }
                else {
                    io.to(roomId).emit('opponentDisconnected');
                }
                break;
            }
        }
    });
});
httpServer.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
