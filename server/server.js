const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

console.log('=== 🚀 MONGODB DEBUG START ===');
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI first 60 chars:', process.env.MONGODB_URI.substring(0, 60));
  
  // Check connection string format
  const uri = process.env.MONGODB_URI;
  if (uri.includes('<db_password>')) {
    console.log('❌ ERROR: <db_password> not replaced with actual password');
  }
  if (uri.includes('@monitoring.kc7dmzg.mongodb.net/')) {
    console.log('✅ Cluster URL format correct');
  }
}
console.log('=== 🔍 MONGODB DEBUG END ===');

// Database connection with detailed error handling
mongoose.connect(process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MONGODB CONNECTED SUCCESSFULLY!');
  console.log('Database Name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
})
.catch(error => {
  console.error('❌ MONGODB CONNECTION FAILED:');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  
  if (error.name === 'MongoNetworkError') {
    console.error('🔧 SOLUTION: Add 0.0.0.0/0 to Network Access in MongoDB Atlas');
  } else if (error.name === 'MongoServerSelectionError') {
    console.error('🔧 SOLUTION: Check username/password and cluster status');
  } else if (error.name === 'MongooseError') {
    console.error('🔧 SOLUTION: Check connection string format');
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected', 
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({
    success: true,
    message: 'Database Debug Info',
    database: {
      status: statusMap[dbStatus],
      readyState: dbStatus,
      connected: dbStatus === 1
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MongoDB Debug Server',
    instruction: 'Check Vercel logs for detailed connection error'
  });
});

console.log('✅ Debug server ready');
module.exports = app;