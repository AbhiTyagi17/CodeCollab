const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  createProject,
  getProjects,
  getProject,
} = require("../controllers/projectController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProject);

module.exports = router;
