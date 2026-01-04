import mongoose from 'mongoose';

/**
 * Message Schema (embedded in Session)
 */
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  model: {
    type: String,
    default: null
  },
  prompt_tokens: {
    type: Number,
    default: null
  },
  completion_tokens: {
    type: Number,
    default: null
  },
  total_tokens: {
    type: Number,
    default: null
  }
}, {
  timestamps: true // Adds createdAt timestamp
});

/**
 * Session Schema
 * Stores chat sessions and conversation history
 */
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  messages: [messageSchema],
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Convert messages to array format
      ret.messages = ret.messages || [];
      return ret;
    }
  }
});

// Indexes for faster queries
sessionSchema.index({ userId: 1, lastActivity: -1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ lastActivity: -1 });

/**
 * Update lastActivity and increment messageCount before saving
 */
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  this.messageCount = this.messages ? this.messages.length : 0;
  next();
});

/**
 * Add message to session
 */
sessionSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.messageCount = this.messages.length;
  this.lastActivity = new Date();
};

/**
 * Get conversation history formatted for OpenAI
 */
sessionSchema.methods.getConversationHistory = function(limit = null) {
  let messages = this.messages || [];
  
  if (limit && limit > 0) {
    messages = messages.slice(-limit); // Get last N messages
  }
  
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.createdAt
  }));
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;


