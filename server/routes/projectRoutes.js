const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getMessages } = require('../controllers/chatController');
const { 
  createProject, 
  getProjects, 
  getProject, 
  saveProject,
  executeCode,
  saveVersion,
  getVersions,
  restoreVersion
} = require('../controllers/projectController');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.put('/:id/save', protect, saveProject);
router.get('/messages/:roomId', protect, getMessages);
router.post('/execute', protect, executeCode);
router.post('/versions', protect, saveVersion);
router.get('/versions/:projectId', protect, getVersions);
router.post('/versions/:versionId/restore', protect, restoreVersion);

module.exports = router;