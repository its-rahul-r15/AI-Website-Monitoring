const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

console.log('=== 🚀 STAGE 5: DATABASE DEBUGGING ===');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Database connection with detailed error logging
const connectDB = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    console.log('MONGODB_URI first 50 chars:', process.env.MONGODB_URI.substring(0, 50) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    return true;
    
  } catch (error) {
    console.error('❌ MONGODB CONNECTION FAILED:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.error('🔧 Solution: Check Network Access in MongoDB Atlas - add IP 0.0.0.0/0');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 Solution: Check cluster status and credentials');
    } else if (error.name === 'MongooseError') {
      console.error('🔧 Solution: Check connection string format');
    }
    
    return false;
  }
};

// Database state
let dbConnected = false;

// Connect to database
connectDB().then(connected => {
  dbConnected = connected;
  if (connected) {
    console.log('🎉 Database ready - all features available');
  } else {
    console.log('⚠️ Database unavailable - some features disabled');
  }
});

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server running',
    database: dbConnected ? '✅ Connected' : '❌ Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({
        success: false,
        message: 'Database not connected',
        error: 'Check MongoDB Atlas configuration'
      });
    }

    // Try to execute a simple query
    const mongoose = require('mongoose');
    const adminDb = mongoose.connection.db.admin();
    const dbInfo = await adminDb.serverInfo();
    
    res.json({
      success: true,
      message: 'Database connection test successful',
      database: {
        connected: true,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        version: dbInfo.version
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Routes (will work only if DB connected)
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API',
    database: dbConnected ? '✅ Connected' : '❌ Disconnected - Check MongoDB Atlas',
    instruction: dbConnected ? 'Ready to use' : 'Fix MongoDB Atlas configuration'
  });
});

console.log('✅ Server setup completed');
module.exports = app;