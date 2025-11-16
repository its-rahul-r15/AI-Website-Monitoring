const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

console.log('=== 🚀 STAGE 3: ORIGINAL ROUTES ===');

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
    message: 'Stage 3: Original routes ✅',
    timestamp: new Date().toISOString()
  });
});

// STEP 1: Add auth routes only first
try {
  console.log('🔄 Loading auth routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Auth routes failed:', error.message);
}

// STEP 2: Test if auth routes work, then add other routes
// app.use('/api/websites', require('./routes/websites'));
// app.use('/api/monitor', require('./routes/monitor'));
// app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stage 3: Original auth routes loaded',
    status: 'Testing auth routes'
  });
});

console.log('✅ Stage 3 server setup completed');

module.exports = app;