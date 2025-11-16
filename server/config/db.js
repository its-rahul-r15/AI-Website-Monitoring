const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    // Specific error messages
    if (error.name === 'MongoParseError') {
      console.error('🔧 Solution: Check your MONGODB_URI format');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🔧 Solution: Check network connection or MongoDB Atlas whitelist');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('🔧 Solution: Check MongoDB Atlas cluster status');
    }
    
    throw error; // Re-throw so server can catch it
  }
};

module.exports = connectDB;