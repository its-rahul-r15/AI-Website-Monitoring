const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CRITICAL: Check if environment variables exist
console.log('🚀 Server starting...');
console.log('🔍 Checking environment variables:');

// Check each variable individually
const mongodbUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

console.log('MONGODB_URI:', mongodbUri ? '✅ PRESENT' : '❌ MISSING');
console.log('JWT_SECRET:', jwtSecret ? '✅ PRESENT' : '❌ MISSING');

if (!mongodbUri) {
  console.log('❌ MONGODB_URI is required but missing');
}

if (!jwtSecret) {
  console.log('❌ JWT_SECRET is required but missing');
}

// Basic middleware
app.use(express.json());

// Simple health check - NO DATABASE
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working! 🚀',
    database: mongodbUri ? 'Configured' : 'Not Configured',
    auth: jwtSecret ? 'Configured' : 'Not Configured'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Health check OK ✅',
    timestamp: new Date().toISOString()
  });
});

// Test route without any dependencies
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'development'
  });
});

console.log('✅ Server setup completed successfully');

// Export for Vercel
module.exports = app;