const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

console.log('🚀 AI Website Monitoring API Starting...');
console.log('MONGODB_URI:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET:', !!process.env.JWT_SECRET);

// Database connection state
let dbConnected = false;
let dbConnectionPromise = null;

// Initialize database with proper connection handling
const initializeDB = async () => {
  try {
    console.log('🔄 Starting database connection...');
    await connectDB();
    dbConnected = true;
    console.log('✅ Database connected successfully');
    
    // Setup cron jobs after DB connection
    try {
      const { setupCronJobs } = require('./utils/cronJobs');
      setupCronJobs();
      console.log('✅ Cron jobs initialized');
    } catch (cronError) {
      console.warn('⚠️ Cron jobs failed:', cronError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    dbConnected = false;
  }
};

// Start DB connection and store the promise
dbConnectionPromise = initializeDB();

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

// Middleware to ensure DB is connected before API routes
app.use('/api/*', async (req, res, next) => {
  try {
    // Wait for DB connection to complete
    if (!dbConnected && dbConnectionPromise) {
      console.log('⏳ Waiting for database connection...');
      await dbConnectionPromise;
    }
    
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please try again.',
        database: 'disconnected'
      });
    }
    
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(503).json({
      success: false,
      message: 'Database service unavailable',
      database: 'error'
    });
  }
});

// Health check (works without DB)
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running! ✅',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'connecting'
  });
});

// Test route (works without DB)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working!',
    database: dbConnected ? 'connected' : 'connecting'
  });
});

// All routes - they will wait for DB connection
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API 🚀',
    database: dbConnected ? 'connected' : 'connecting',
    status: 'All systems operational'
  });
});

console.log('✅ Server initialized - waiting for DB connection');
module.exports = app;