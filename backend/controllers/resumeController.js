const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const {
  parseResumeText,
  calculateAtsScore,
  analyzeSkillGap,
  generateImprovementSuggestions,
} = require("../services/geminiService");

// Helper to extract text based on file type
const extractTextFromFile = async (buffer, mimeType, originalName) => {
  const extension = originalName.split(".").pop().toLowerCase();
  
  if (mimeType === "application/pdf" || extension === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else {
    throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
  }
};

const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { buffer, mimetype, originalname } = req.file;
    const rawText = await extractTextFromFile(buffer, mimetype, originalname);
    
    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from file." });
    }

    // Call Gemini API to parse resume text into structural JSON
    const parsedData = await parseResumeText(rawText);

    // Save to database
    const fileType = originalname.split(".").pop().toLowerCase() === "pdf" ? "pdf" : "docx";
    
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: originalname,
      fileType,
      rawText,
      parsedData,
    });

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume,
    });
  } catch (error) {
    console.error("Error in uploadAndParseResume:", error);
    res.status(500).json({ message: error.message });
  }
};

const runAtsScore = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: "Resume ID and job description are required." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // Call Gemini to get ATS score and keywords
    const atsResult = await calculateAtsScore(resume.rawText, jobDescription);
    
    resume.atsAnalysis = {
      jobDescription,
      score: atsResult.score,
      matchingKeywords: atsResult.matchingKeywords,
      missingKeywords: atsResult.missingKeywords,
      recommendations: atsResult.recommendations,
    };

    await resume.save();

    res.status(200).json({
      message: "ATS Score calculated successfully",
      atsAnalysis: resume.atsAnalysis,
    });
  } catch (error) {
    console.error("Error in runAtsScore:", error);
    res.status(500).json({ message: error.message });
  }
};

const runSkillGapAnalysis = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: "Resume ID and job description are required." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const skills = resume.parsedData.skills || [];
    
    // Call Gemini for skill gaps
    const gapResult = await analyzeSkillGap(skills, jobDescription);

    resume.skillGapAnalysis = {
      jobDescription,
      matchingSkills: gapResult.matchingSkills,
      missingSkills: gapResult.missingSkills,
      recommendations: gapResult.recommendations,
    };

    await resume.save();

    res.status(200).json({
      message: "Skill gap analysis completed successfully",
      skillGapAnalysis: resume.skillGapAnalysis,
    });
  } catch (error) {
    console.error("Error in runSkillGapAnalysis:", error);
    res.status(500).json({ message: error.message });
  }
};

const getImprovementSuggestionsEndpoint = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: "Resume ID is required." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // Call Gemini for suggestions
    const suggestions = await generateImprovementSuggestions(resume.rawText);

    resume.improvementSuggestions = suggestions;
    await resume.save();

    res.status(200).json({
      message: "Resume improvements generated successfully",
      improvementSuggestions: resume.improvementSuggestions,
    });
  } catch (error) {
    console.error("Error in getImprovementSuggestionsEndpoint:", error);
    res.status(500).json({ message: error.message });
  }
};

const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select("fileName fileType createdAt atsAnalysis.score")
      .sort({ createdAt: -1 });

    res.status(200).json({ resumes });
  } catch (error) {
    console.error("Error in getResumeHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }
    res.status(200).json({ resume });
  } catch (error) {
    console.error("Error in getResumeById:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadAndParseResume,
  runAtsScore,
  runSkillGapAnalysis,
  getImprovementSuggestionsEndpoint,
  getResumeHistory,
  getResumeById,
};
