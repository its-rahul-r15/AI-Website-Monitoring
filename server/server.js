const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CRITICAL: Debug environment variables
console.log('=== 🚀 VERCEL DEBUG START ===');
console.log('All environment variables:', Object.keys(process.env));
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.MONGODB_URI) {
  console.log('❌ CRITICAL: MONGODB_URI is MISSING');
} else {
  console.log('✅ MONGODB_URI is present');
}

if (!process.env.JWT_SECRET) {
  console.log('❌ CRITICAL: JWT_SECRET is MISSING');
} else {
  console.log('✅ JWT_SECRET is present');
}
console.log('=== 🔍 VERCEL DEBUG END ===');

// Basic middleware
app.use(express.json());

// Simple route - NO DATABASE, NO ROUTES
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Basic server is working!',
    mongodb: !!process.env.MONGODB_URI,
    jwt: !!process.env.JWT_SECRET
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Health check OK',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Debug server setup completed');

module.exports = app;