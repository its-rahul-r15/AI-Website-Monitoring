const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  telegramChatId: {
    type: String,
    default: null
  },
  notificationPreferences: {
    downtime: { type: Boolean, default: true },
    performance: { type: Boolean, default: true },
    seo: { type: Boolean, default: true },
    ssl: { type: Boolean, default: true },
    brokenLinks: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Password hash karna before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password compare karne ka method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);