const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  uploadAndParseResume,
  runAtsScore,
  runSkillGapAnalysis,
  getImprovementSuggestionsEndpoint,
  getResumeHistory,
  getResumeById,
} = require("../controllers/resumeController");

const protect = require("../middleware/authMiddleware");

// Setup multer for memory storage uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post("/upload", protect, upload.single("resume"), uploadAndParseResume);
router.post("/analyze-ats", protect, runAtsScore);
router.post("/skill-gap", protect, runSkillGapAnalysis);
router.post("/improvements", protect, getImprovementSuggestionsEndpoint);
router.get("/history", protect, getResumeHistory);
router.get("/:id", protect, getResumeById);

module.exports = router;
