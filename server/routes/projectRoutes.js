const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createProject, getProjects, getProject, saveProject  } = require('../controllers/projectController');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.put('/:id/save', protect, saveProject);

module.exports = router;