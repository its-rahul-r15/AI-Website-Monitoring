const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

console.log('🚀 Server Stage 2: Adding Routes...');
console.log('MONGODB_URI:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET:', !!process.env.JWT_SECRET);

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
    message: 'Server is healthy! ✅',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working!',
    stage: 'Stage 2: Ready for auth'
  });
});

// Add auth routes FIRST
app.use('/api/auth', require('./routes/auth'));

// Comment out other routes for now
// app.use('/api/websites', require('./routes/websites'));
// app.use('/api/monitor', require('./routes/monitor'));
// app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Website Monitoring API 🚀',
    status: 'Stage 2: Auth routes added',
    nextStep: 'Test /api/auth endpoints'
  });
});

console.log('✅ Stage 2 server setup completed');

module.exports = app;