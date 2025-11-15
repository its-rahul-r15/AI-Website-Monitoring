const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  monitoringEnabled: {
    type: Boolean,
    default: true
  },
  checkInterval: {
    type: Number,
    default: 5 // minutes
  },
  lastChecked: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['up', 'down', 'unknown'],
    default: 'unknown'
  },
  uptime: {
    type: Number,
    default: 100 // percentage - start with 100%
  },
  performanceScore: {
    type: Number,
    default: 0
  },
  seoScore: {
    type: Number,
    default: 0
  },
  sslValid: {
    type: Boolean,
    default: false
  },
  sslExpires: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number, // milliseconds
    default: 0
  },
  brokenLinks: [{
    url: String,
    status: Number,
    foundOn: String
  }]
}, {
  timestamps: true
});

// URL unique banaye ek user ke liye
websiteSchema.index({ userId: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('Website', websiteSchema);