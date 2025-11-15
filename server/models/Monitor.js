const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  checkTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['up', 'down'],
    required: true
  },
  responseTime: {
    type: Number, // milliseconds
    default: 0
  },
  performanceMetrics: {
    performance: Number,
    accessibility: Number,
    bestPractices: Number,
    seo: Number
  },
  issues: [{
    type: String,
    description: String,
    severity: String // low, medium, high
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Monitor', monitorSchema);