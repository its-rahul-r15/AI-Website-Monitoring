const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
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

// Test route (before DB connection)
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString()
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

// Database connection with error handling
const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Setup cron jobs only after DB connection
    const { setupCronJobs } = require('./utils/cronJobs');
    setupCronJobs();
    console.log('✅ Cron jobs initialized');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// For Vercel, we need to export the app without listening
if (process.env.NODE_ENV === 'production') {
  // Initialize server for Vercel
  startServer();
  module.exports = app;
} else {
  // For local development
  startServer().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}