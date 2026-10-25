const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  accountKey: {
    type: String,
    default: 'owner',
    unique: true,
    immutable: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  totpSecret: {
    type: String,
    required: true,
    select: false
  },
  enabled: {
    type: Boolean,
    default: false
  },
  lastTotpStep: {
    type: Number,
    default: -1,
    select: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
