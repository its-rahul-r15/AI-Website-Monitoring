const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

console.log('=== 🚀 STAGE 4: ADDING DATABASE ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Present' : '❌ Missing');

// Database connection state
let dbConnected = false;

// Simple database connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    dbConnected = true;
    console.log('✅ Database connected successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    dbConnected = false;
  }
};

// Start DB connection (non-blocking)
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://ai-website-monitoring.vercel.app',
    'https://ai-website-monitoring-*.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json());

// Health check with DB status
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stage 4: Database added',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Database status check
app.get('/api/db-status', (req, res) => {
  res.json({
    success: true,
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState,
      states: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }
    }
  });
});

// Your original routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/websites', require('./routes/websites'));
// app.use('/api/monitor', require('./routes/monitor'));
// app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stage 4: Database connection added',
    database: dbConnected ? '✅ Connected' : '❌ Disconnected'
  });
});

console.log('✅ Stage 4 server setup completed');
module.exports = app;