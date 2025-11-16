const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars - FIRST THING
dotenv.config();

const app = express();

// Debug environment variables
console.log('🔍 Environment Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Present' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

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

// Test route (DB connection se pehle bhi kaam karega)
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
    database: 'Checking...'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API is running on Vercel 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection with PROPER error handling
const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to database...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }
    
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Cron jobs initialize karo - only after DB connection
    try {
      const { setupCronJobs } = require('./utils/cronJobs');
      setupCronJobs();
      console.log('✅ Cron jobs initialized');
    } catch (cronError) {
      console.warn('⚠️ Cron jobs initialization failed:', cronError.message);
      // Cron jobs error server ko crash nahi karega
    }
    
    console.log('🎉 Server startup completed successfully');
    
  } catch (error) {
    console.error('💥 CRITICAL: Server startup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

// Vercel ke liye app export karo
module.exports = app;