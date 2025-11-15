const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { setupCronJobs } = require('./utils/cronJobs');

// Load env variables
dotenv.config();

// Database connect karo
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes - YE ADD KARO
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram')); // ✅ YEH LINE ADD KARO

// Simple routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Website Monitor API is running! 🚀',
    version: '1.0.0'
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 AI Website Monitor Backend Ready!`);
  console.log(`📍 http://localhost:${PORT}`);
  
  // Cron jobs start karo
  setupCronJobs();
});