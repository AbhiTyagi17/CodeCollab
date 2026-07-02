const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    default: 'javascript'
  },
  currentCode: {
    type: String,
    default: '// Start coding here...'
  },
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true
  },
  roomCode: { 
    type: String,
    required: true,
    unique: true 
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp manually in controller (safer)
const Project = mongoose.model('Project', projectSchema);
module.exports = Project;