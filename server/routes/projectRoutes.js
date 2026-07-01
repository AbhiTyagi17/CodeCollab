const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createProject, getProjects, getProject, saveProject , executeCode  } = require('../controllers/projectController');
const { getMessages } = require('../controllers/chatController');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.put('/:id/save', protect, saveProject);
router.get('/messages/:roomId', protect, getMessages);
router.post('/execute', protect, executeCode);

module.exports = router;