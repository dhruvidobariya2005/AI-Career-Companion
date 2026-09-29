const express = require("express");
const router = express.Router();

const {
  generateRoadmapEndpoint,
  getCurrentRoadmap,
  updateStepProgress,
} = require("../controllers/roadmapController");

const protect = require("../middleware/authMiddleware");

router.post("/generate", protect, generateRoadmapEndpoint);
router.get("/current", protect, getCurrentRoadmap);
router.put("/:roadmapId/step/:stepId", protect, updateStepProgress);

module.exports = router;
