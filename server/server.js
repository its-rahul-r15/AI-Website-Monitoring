const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

console.log('=== 🚀 ENHANCED MONGODB DEBUG ===');
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

// Remove deprecated option
mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  // useUnifiedTopology: true, // REMOVED - deprecated
  serverSelectionTimeoutMS: 15000,
})
.then(() => {
  console.log('🎉 MONGODB CONNECTED SUCCESSFULLY!');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
})
.catch(error => {
  console.error('💥 MONGODB CONNECTION ERROR:');
  console.error('Error Name:', error.name);
  console.error('Error Code:', error.code);
  console.error('Error Message:', error.message);
  
  // Specific error solutions
  if (error.name === 'MongoServerSelectionError') {
    console.error('🔧 Check: MongoDB Atlas Network Access - add 0.0.0.0/0');
    console.error('🔧 Check: Username and password in connection string');
  }
});

app.use(cors());
app.use(express.json());

// Enhanced health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    success: true,
    message: 'Enhanced Health Check',
    database: {
      status: states[dbState],
      readyState: dbState,
      connected: dbState === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    environment: {
      node_env: process.env.NODE_ENV,
      mongodb_uri_configured: !!process.env.MONGODB_URI
    }
  });
});

// Test actual database operation
app.get('/api/db-operation', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: false,
        message: 'Database not connected',
        readyState: mongoose.connection.readyState,
        solution: 'Check MongoDB Atlas Network Access'
      });
    }

    // Try to create a test collection
    const db = mongoose.connection.db;
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    
    const count = await testCollection.countDocuments();
    
    res.json({
      success: true,
      message: 'Database operation successful!',
      operation: 'insert and count',
      documents: count
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Database operation failed',
      error: error.message,
      errorName: error.name
    });
  }
});

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: true,
    message: 'MongoDB Connection Test Server',
    database: dbConnected ? '✅ CONNECTED' : '❌ DISCONNECTED',
    checkEndpoints: [
      '/health - Connection status',
      '/api/db-operation - Test database operations'
    ]
  });
});

console.log('✅ Enhanced debug server ready');
module.exports = app;