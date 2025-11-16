const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

console.log('🔍 Environment Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Present' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Present' : '❌ Missing');

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

// Health check without DB
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString()
  });
});

// Lazy load routes with DB connection
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API is running on Vercel 🚀'
  });
});

// Initialize DB on first request (Lazy loading)
let dbInitialized = false;
const initializeDB = async () => {
  if (!dbInitialized) {
    try {
      const connectDB = require('./config/database');
      await connectDB();
      console.log('✅ Database connected on first request');
      
      // Start cron jobs
      const { setupCronJobs } = require('./utils/cronJobs');
      setupCronJobs();
      console.log('✅ Cron jobs started');
      
      dbInitialized = true;
    } catch (error) {
      console.error('❌ DB initialization failed:', error.message);
    }
  }
};

// Middleware to initialize DB on API requests
app.use('/api/*', async (req, res, next) => {
  await initializeDB();
  next();
});

console.log('✅ Server setup completed - DB will initialize on first request');

module.exports = app;