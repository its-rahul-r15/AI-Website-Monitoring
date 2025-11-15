const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { setupCronJobs } = require('./utils/cronJobs');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/telegram', require('./routes/telegram'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running on Vercel 🚀' });
});

// Export app (IMPORTANT for Vercel)
module.exports = app;
