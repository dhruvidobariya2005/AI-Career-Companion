const express = require("express");
const router = express.Router();

const {
  generateMockInterview,
  submitAnswer,
  completeMockInterview,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

router.post("/generate", protect, generateMockInterview);
router.post("/submit-answer", protect, submitAnswer);
router.post("/complete", protect, completeMockInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewById);

module.exports = router;
