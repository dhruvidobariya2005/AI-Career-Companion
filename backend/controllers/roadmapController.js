const Roadmap = require("../models/Roadmap");
const { generateCareerRoadmap } = require("../services/geminiService");

const generateRoadmapEndpoint = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;

    if (!targetRole) {
      return res.status(400).json({ message: "Target Role is required." });
    }

    const skillsArray = Array.isArray(currentSkills)
      ? currentSkills
      : currentSkills
      ? currentSkills.split(",").map((s) => s.trim())
      : [];

    // Call Gemini API to generate the steps
    const result = await generateCareerRoadmap(targetRole, skillsArray);

    // Save/Overwrite roadmap for the user (we keep one active roadmap or list them; let's create a new one each time)
    const roadmap = await Roadmap.create({
      userId: req.user.id,
      targetRole,
      currentSkills: skillsArray,
      steps: result.steps.map((step) => ({
        ...step,
        isCompleted: false,
      })),
    });

    res.status(201).json({
      message: "Career roadmap generated successfully",
      roadmap,
    });
  } catch (error) {
    console.error("Error in generateRoadmapEndpoint:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCurrentRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: "No career roadmap found." });
    }
    res.status(200).json({ roadmap });
  } catch (error) {
    console.error("Error in getCurrentRoadmap:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateStepProgress = async (req, res) => {
  try {
    const { roadmapId, stepId } = req.params;
    const { isCompleted } = req.body;

    if (isCompleted === undefined) {
      return res.status(400).json({ message: "isCompleted status is required." });
    }

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found." });
    }

    const step = roadmap.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ message: "Step not found." });
    }

    step.isCompleted = isCompleted;
    await roadmap.save();

    res.status(200).json({
      message: "Step progress updated successfully",
      roadmap,
    });
  } catch (error) {
    console.error("Error in updateStepProgress:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateRoadmapEndpoint,
  getCurrentRoadmap,
  updateStepProgress,
};
