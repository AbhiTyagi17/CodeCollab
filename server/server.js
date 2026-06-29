require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

app.get('/', (req, res) => {
  res.send('CollabCode Backend is Running 🚀');
});

// Connect to Database and Start Server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  // Socket.io Setup
  const { Server } = require('socket.io');
  const authenticateSocket = require('./sockets/authSocket');

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ["GET", "POST"]
    }
  });

  // Socket Authentication
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id, '| Email:', socket.user?.email);

    socket.on('join-room', ({ projectId }) => {
      socket.join(projectId);
      console.log(`User ${socket.user.email} joined room: ${projectId}`);
    });

    socket.on('code-change', ({ projectId, code }) => {
      socket.to(projectId).emit('receive-change', { code });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log('✅ Socket.io initialized');

}).catch((err) => {
  console.error('Failed to start server due to DB error:', err);
});