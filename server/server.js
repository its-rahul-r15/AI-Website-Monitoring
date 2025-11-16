const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

console.log('🚀 AI Website Monitoring API Starting on Vercel...');
console.log('🔍 Environment Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Present' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Database connection with error handling
const initializeDB = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected Successfully');
    
    // Cron jobs start karo after DB connection
    try {
      const { setupCronJobs } = require('./utils/cronJobs');
      setupCronJobs();
      console.log('✅ Cron Jobs Initialized');
    } catch (cronError) {
      console.warn('⚠️ Cron Jobs Failed:', cronError.message);
    }
    
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    // Server crash nahi karega - Vercel ke liye important
  }
};

// Initialize DB (non-blocking)
initializeDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://ai-website-monitoring.vercel.app',
    'https://ai-website-monitoring-*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram'));

// Simple routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Website Monitor API is running on Vercel! 🚀',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy! ✅',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ✅ VERCEL COMPATIBLE EXPORT (No app.listen)
console.log('✅ Server initialized successfully - Ready for Vercel');
module.exports = app;