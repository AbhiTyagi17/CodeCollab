const Project = require("../models/Project");
const Version = require("../models/Version");
const axios = require("axios");

// Helper Functions
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateInviteToken = () => {
  return Math.random().toString(36).substring(2, 15);
};

const createProject = async (req, res) => {
  try {
    const { title, description, language } = req.body;

    const project = await Project.create({
      title,
      description,
      language: language || "javascript",
      roomCode: generateRoomCode(),
      inviteToken: generateInviteToken(),
      createdBy: req.user.id,
      collaborators: [req.user.id],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user.id }, { collaborators: req.user.id }],
    })
      .populate("createdBy", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("collaborators", "name email avatar");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.createdBy._id.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      (c) => c._id.toString() === req.user.id,
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const saveProject = async (req, res) => {
  try {
    const { currentCode } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    project.currentCode = currentCode;
    await project.save();

    res.json({ message: "Project saved", project });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const executeCode = async (req, res) => {
  try {
    const { code, language, input = "" } = req.body;

    let output = `Executed ${language} code successfully (Mock for prototype)`;
    if (language === "javascript")
      output = "Hello from CollabCode!\nJS executed.";
    if (language === "python")
      output = "Hello from CollabCode!\nPython executed.";

    await new Promise((resolve) => setTimeout(resolve, 600));

    res.json({
      output,
      error: "",
      status: "Success",
      note: "Mock execution - Judge0 can be integrated later",
    });
  } catch (error) {
    res.status(500).json({ message: "Execution failed" });
  }
};

const joinByInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const project = await Project.findOne({ inviteToken: token });

    if (!project) {
      return res.status(404).json({ message: "Invalid invite link" });
    }

    if (!project.collaborators.includes(req.user.id)) {
      project.collaborators.push(req.user.id);
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to join project" });
  }
};

// Join using room code
const joinByRoomCode = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const project = await Project.findOne({ roomCode });

    if (!project) {
      return res.status(404).json({ message: "Invalid room code" });
    }

    if (!project.collaborators.includes(req.user.id)) {
      project.collaborators.push(req.user.id);
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to join project" });
  }
};

const saveVersion = async (req, res) => {
  try {
    const { projectId, codeSnapshot } = req.body;
    const version = await Version.create({
      projectId,
      codeSnapshot,
      createdBy: req.user.id,
    });
    res.status(201).json(version);
  } catch (error) {
    res.status(500).json({ message: "Failed to save version" });
  }
};

const getVersions = async (req, res) => {
  try {
    const versions = await Version.find({
      projectId: req.params.projectId,
    }).sort({ createdAt: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

const restoreVersion = async (req, res) => {
  try {
    const version = await Version.findById(req.params.versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    await Project.findByIdAndUpdate(version.projectId, {
      currentCode: version.codeSnapshot,
    });

    res.json({ message: "Version restored successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore version" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  saveProject,
  executeCode,
  saveVersion,
  getVersions,
  restoreVersion,
  joinByInvite,
  joinByRoomCode,
};
