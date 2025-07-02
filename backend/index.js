const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { AccessToken } = require('livekit-server-sdk');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS Setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Request Body Limit
app.use(express.json({ limit: '1mb' }));

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});
app.use(limiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' }
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/quiz', require('./routes/quiz'));
app.use('/attempt', require('./routes/attempt'));
app.use('/admin', require('./routes/admin'));
app.use('/courses', require('./routes/courses'));
app.use('/studymaterials', require('./routes/studyMaterial'));
app.use('/profile', require('./routes/profile'));
app.use('/message', require('./routes/message'));
app.use('/notification', require('./routes/notification'));
app.use('/connection', require('./routes/connection'));
app.use('/opportunities', require('./routes/opportunities'));

// Code Compilation Endpoint
app.post('/api/compile', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  if (!source_code || !language_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Code compilation error:', error.message);

    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'API error', 
        details: error.response.data 
      });
    } else if (error.request) {
      res.status(504).json({ error: 'API timeout' });
    } else {
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  }
});

// LiveKit Token Endpoint
app.post('/api/get-token', (req, res) => {
  const { roomName, participantName } = req.body;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'Room name and participant name are required' });
  }

  if (typeof roomName !== 'string' || typeof participantName !== 'string') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  if (roomName.length > 50 || participantName.length > 50) {
    return res.status(400).json({ error: 'Room name or participant name too long' });
  }

  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      }
    );

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    const token = at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('LiveKit token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB + Server Start
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
