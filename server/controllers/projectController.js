const Project = require('../models/Project');

// Generate unique room code and invite token
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateInviteToken = () => {
  return Math.random().toString(36).substring(2, 15);
};

// @desc   Create new project
// @route  POST /projects
const createProject = async (req, res) => {
  try {
    const { title, description, language } = req.body;

    const project = await Project.create({
      title,
      description,
      language: language || 'javascript',
      roomCode: generateRoomCode(),
      inviteToken: generateInviteToken(),
      createdBy: req.user.id,
      collaborators: [req.user.id],
      updatedAt: Date.now()
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Project Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get all user projects
// @route  GET /projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get single project
// @route  GET /projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('collaborators', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const isOwner = project.createdBy._id.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(c => c._id.toString() === req.user.id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const saveProject = async (req, res) => {
  try {
    const { currentCode } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.currentCode = currentCode;
    await project.save();

    res.json({ message: 'Project saved', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, getProjects, getProject, saveProject  };