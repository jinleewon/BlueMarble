const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for local testing
    methods: ["GET", "POST"]
  }
});

const rooms = {}; // { roomCode: { host: socketId, clients: [socketId], gameState: {} } }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', (roomCode) => {
    socket.join(roomCode);
    rooms[roomCode] = { host: socket.id, clients: [socket.id], gameState: null };
    console.log(`Room created: ${roomCode} by ${socket.id}`);
  });

  socket.on('join_room', (data, callback) => {
    // data can be a string (roomCode) or an object { roomCode, nickname }
    const roomCode = typeof data === 'string' ? data : data.roomCode;
    const nickname = typeof data === 'string' ? null : data.nickname;
    
    const room = rooms[roomCode];
    if (room) {
      socket.join(roomCode);
      room.clients.push(socket.id);
      const assignedId = room.clients.length;
      console.log(`User ${socket.id} joined room ${roomCode} as Player ${assignedId} (${nickname})`);
      // Request full state sync from the host and pass the new player's nickname
      io.to(room.host).emit('request_state_sync', { nickname });
      if (typeof callback === 'function') callback({ success: true, playerId: assignedId });
    } else {
      console.log(`User ${socket.id} tried to join non-existent room ${roomCode}`);
      if (typeof callback === 'function') callback({ success: false, message: 'Room not found' });
    }
  });

  socket.on('sync_state', ({ roomCode, state }) => {
    // The host sends the current state, relay it to everyone else in the room
    const room = rooms[roomCode];
    if (room) {
      room.gameState = state;
      // Emit to everyone in the room except the sender
      socket.to(roomCode).emit('state_updated', state);
    }
  });

  socket.on('dispatch_action', ({ roomCode, action }) => {
    console.log(`Action dispatched in room ${roomCode}:`, action.type);
    // Broadcast the action to everyone else in the room
    socket.to(roomCode).emit('action_dispatched', action);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      if (room.clients.includes(socket.id)) {
        room.clients = room.clients.filter(id => id !== socket.id);
        if (room.host === socket.id && room.clients.length > 0) {
          // Reassign host
          room.host = room.clients[0];
          console.log(`Host reassigned for room ${roomCode} to ${room.host}`);
        } else if (room.clients.length === 0) {
          // Clean up empty room
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted (empty)`);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
