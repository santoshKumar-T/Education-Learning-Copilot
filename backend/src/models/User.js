import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Stores user account information
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove password from JSON output
      delete ret.password;
      return ret;
    }
  }
});

// Index for faster queries (email already has unique index, so only add createdAt)
userSchema.index({ createdAt: -1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function() {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    throw error;
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Add session to user
 */
userSchema.methods.addSession = function(sessionId) {
  if (!this.sessions.includes(sessionId)) {
    this.sessions.push(sessionId);
  }
};

/**
 * Remove session from user
 */
userSchema.methods.removeSession = function(sessionId) {
  this.sessions = this.sessions.filter(
    id => id.toString() !== sessionId.toString()
  );
};

/**
 * Convert user to JSON (public format without password)
 */
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;

