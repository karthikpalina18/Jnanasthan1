const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const axios = require('axios');
const { AccessToken } = require('livekit-server-sdk');
const rateLimit = require('express-rate-limit');
// Add this at the top of your server.js file

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken'); // Make sure you have jsonwebtoken installed

// Load environment variables
dotenv.config();

// You already have all the necessary models imported in your route files

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const attemptRoutes = require('./routes/attempt');
const adminRoutes = require('./routes/admin');
const profileRoutes=require('./routes/profile');


// Import middleware
const { socketAuth } = require('./middleware/auth');

// Initialize express app and create HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS with more restrictive options
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Parse JSON request body
app.use(express.json({ limit: '1mb' })); // Add size limit

// Add global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later' }
});
app.use(limiter);

// Apply more strict rate limits to auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 auth attempts per 15 minutes
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/attempt', attemptRoutes);
app.use('/api/admin', adminRoutes);
// Add collaboration routes



app.use('/api/courses', require('./routes/courses'));
app.use('/api/studymaterials', require('./routes/studyMaterial'));
app.use('/api/profile',require('./routes/profile'))
app.use('/api/message',require('./routes/message'))
app.use('/api/notification',require('./routes/notification'))
app.use('/api/connection',require('./routes/connection'))
app.use('/api/opportunities',require('./routes/opportunities'))

// Store room data and user sockets and make it available to routes
const rooms = {};
const userSockets = {};
app.set('rooms', rooms);
app.set('userSockets', userSockets);

// Initialize Socket.io server with authentication
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to route handlers
app.set('io', io);

// Apply authentication middleware to socket connections
io.use(socketAuth);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}, User: ${socket.user?.username || 'Anonymous'}`);
  
  // Store user's socket ID when they authenticate
  if (socket.user) {
    userSockets[socket.user.id] = socket.id;
    console.log(`User ${socket.user.username} (${socket.user.id}) connected with socket ${socket.id}`);
  }
  
  // Join room handler
  socket.on('join-room', ({ roomId, username }) => {
    // Validate inputs
    if (!roomId || !username) {
      socket.emit('error', { message: 'Room ID and username are required' });
      return;
    }
    
    console.log(`${username} (${socket.id}) joining room: ${roomId}`);
    
    // Join the room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { users: {} };
    }
    
    // Add user to room data
    rooms[roomId].users[socket.id] = {
      username,
      id: socket.id,
      role: socket.user?.role || 'user'
    };
    
    // Notify existing users in the room about the new user
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username,
      role: socket.user?.role || 'user'
    });
    
    // Send current users in the room to the new user
    const usersInRoom = Object.values(rooms[roomId].users)
      .filter(user => user.id !== socket.id);
      
    socket.emit('room-users', usersInRoom);
  });
  
  // Handle WebRTC signaling: offer
  socket.on('offer', ({ target, caller, sdp }) => {
    // Validate inputs
    if (!target || !caller || !sdp) {
      socket.emit('error', { message: 'Invalid offer data' });
      return;
    }
    
    console.log(`Forwarding offer from ${caller} to ${target}`);
    io.to(target).emit('offer', {
      caller,
      sdp
    });
  });
  
  // Handle WebRTC signaling: answer
  socket.on('answer', ({ target, caller, sdp }) => {
    // Validate inputs
    if (!target || !caller || !sdp) {
      socket.emit('error', { message: 'Invalid answer data' });
      return;
    }
    
    console.log(`Forwarding answer from ${caller} to ${target}`);
    io.to(target).emit('answer', {
      caller,
      sdp
    });
  });
  
  // Handle WebRTC signaling: ICE candidates
  socket.on('ice-candidate', ({ target, candidate }) => {
    // Validate inputs
    if (!target || !candidate) {
      socket.emit('error', { message: 'Invalid ICE candidate data' });
      return;
    }
    
    console.log(`Forwarding ICE candidate to ${target}`);
    io.to(target).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });
  
  // Handle chat messages
  socket.on('send-message', ({ roomId, message }) => {
    // Validate inputs
    if (!roomId || !message || !message.content || !message.sender) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }
    
    // Basic content sanitization (prevent extremely long messages)
    if (message.content.length > 1000) {
      message.content = message.content.substring(0, 1000) + '... (message truncated)';
    }
    
    console.log(`Message in ${roomId} from ${message.sender}: ${message.content.substring(0, 50)}`);
    
    // Forward message to all other users in the room
    socket.to(roomId).emit('chat-message', message);
  });
  
  // Listen for direct messages between users
  socket.on('direct-message', async (data) => {
    try {
      const { recipientId, content } = data;
      
      if (!socket.user || !recipientId || !content) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      
      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [socket.user.id, recipientId] }
      });
      
      if (!conversation) {
        conversation = new Conversation({
          participants: [socket.user.id, recipientId],
          messages: []
        });
      }
      
      // Add message
      conversation.messages.push({
        sender: socket.user.id,
        content,
        read: false
      });
      
      conversation.lastActivity = Date.now();
      await conversation.save();
      
      const messageId = conversation.messages[conversation.messages.length - 1]._id;
      
      // Send to recipient if online
      const recipientSocketId = userSockets[recipientId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('direct-message', {
          conversationId: conversation._id,
          message: {
            id: messageId,
            content,
            senderId: socket.user.id,
            timestamp: new Date()
          }
        });
      }
      
      // Confirm to sender
      socket.emit('message-sent', {
        conversationId: conversation._id,
        messageId
      });
    } catch (error) {
      console.error('Error handling direct message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from userSockets mapping
    if (socket.user) {
      delete userSockets[socket.user.id];
      console.log(`User ${socket.user.username} (${socket.user.id}) disconnected`);
    }
    
    // Find which rooms the user was in
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      
      if (room.users && room.users[socket.id]) {
        const username = room.users[socket.id].username;
        
        // Notify others in the room that the user has left
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          username
        });
        
        // Remove user from room data
        delete room.users[socket.id];
        
        console.log(`${username} left room ${roomId}`);
        
        // Clean up empty rooms
        if (Object.keys(room.users).length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted - no users left`);
        }
      }
    });
  });
});

// Code compilation endpoint with validation
app.post('/api/compile', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  // Validate required fields
  if (!source_code || !language_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Validate language_id is a number
  if (isNaN(parseInt(language_id))) {
    return res.status(400).json({ error: 'Invalid language ID' });
  }

  try {
    const response = await axios.post(
      `https://${process.env.RAPIDAPI_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code,
        language_id,
        stdin: stdin || '',
      },
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'content-type': 'application/json',
        },
        timeout: 10000, // Set timeout to 10 seconds
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Code compilation error:', error.message);
    
    // Return appropriate error based on error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({ 
        error: 'API error', 
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({ error: 'API timeout' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

// LiveKit token generation endpoint with validation
app.post('/api/get-token', (req, res) => {
  const { roomName, participantName } = req.body;
  
  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'Room name and participant name are required' });
  }
  
  // Validate input format
  if (typeof roomName !== 'string' || typeof participantName !== 'string') {
    return res.status(400).json({ error: 'Invalid input format' });
  }
  
  // Check for reasonable length
  if (roomName.length > 50 || participantName.length > 50) {
    return res.status(400).json({ error: 'Room name or participant name too long' });
  }
  
  try {
    // Create a new access token
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      }
    );
    
    // Grant permissions
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    
    // Generate the token
    const token = at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('LiveKit token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => console.error('❌ MongoDB connection error:', err));