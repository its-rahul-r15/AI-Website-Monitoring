const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // ✅ db.js ko require karo

// Load environment variables
dotenv.config();

const app = express();

console.log('🚀 Server starting with correct DB import...');

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
    message: 'Server is running! ✅',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working!',
    database: 'Correct import mode'
  });
});

// Add auth routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API 🚀',
    status: 'Correct DB import'
  });
});

// Database connection with error handling
const initializeDB = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Setup cron jobs
    try {
      const { setupCronJobs } = require('./utils/cronJobs');
      setupCronJobs();
      console.log('✅ Cron jobs initialized');
    } catch (cronError) {
      console.warn('⚠️ Cron jobs failed:', cronError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Server continues without DB
  }
};

// Start DB connection
initializeDB();

console.log('✅ Server setup completed');
module.exports = app;