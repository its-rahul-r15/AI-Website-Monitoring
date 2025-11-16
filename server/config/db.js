const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    // Better connection options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Specific error handling
    if (error.name === 'MongoNetworkError') {
      console.error('🔧 Solution: Check network connection and IP whitelist');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 Solution: Check MongoDB Atlas cluster status');
    } else if (error.name === 'MongooseError') {
      console.error('🔧 Solution: Check connection string and credentials');
    }
    
    throw error;
  }
};

module.exports = connectDB;