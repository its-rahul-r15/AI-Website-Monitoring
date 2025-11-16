const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const app = express();

console.log('🚀 Server starting with improved DB handling...');

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

// Health check without DB dependency
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running ✅',
    timestamp: new Date().toISOString(),
    database: 'Check connection separately'
  });
});

// Test route without DB
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working!',
    database: 'Not required for this route'
  });
});

// Auth routes with DB connection check
app.use('/api/auth', require('./routes/auth'));

// Other routes (comment out temporarily if needed)
app.use('/api/websites', require('./routes/websites'));
// app.use('/api/monitor', require('./routes/monitor'));
// app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API 🚀',
    status: 'Check MongoDB connection'
  });
});

// Database connection with timeout handling
const initializeDB = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    await connectDB();
    console.log('✅ Database connected - all routes active');
  } catch (error) {
    console.error('❌ Database connection failed - some features unavailable');
    // Server continues running without DB
  }
};

// Start DB connection
initializeDB();

console.log('✅ Server exported successfully');
module.exports = app;