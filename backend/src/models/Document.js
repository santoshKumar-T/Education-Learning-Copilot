import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'txt', 'md'],
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  summary: {
    brief: {
      type: String,
      default: ''
    },
    detailed: {
      type: String,
      default: ''
    },
    comprehensive: {
      type: String,
      default: ''
    }
  },
  keyTopics: [{
    topic: String,
    importance: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  error: {
    type: String,
    default: null
  },
  metadata: {
    pageCount: Number,
    wordCount: Number,
    processingTime: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ status: 1 });

export default mongoose.model('Document', documentSchema);

