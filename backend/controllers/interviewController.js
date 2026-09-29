const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallInterviewFeedback,
} = require("../services/geminiService");

const generateMockInterview = async (req, res) => {
  try {
    const { jobTitle, jobDescription, resumeId } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ message: "Job Title is required." });
    }

    let resumeText = "";
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
      if (resume) {
        resumeText = resume.rawText;
      }
    }

    // Call Gemini to generate questions
    const questions = await generateInterviewQuestions(resumeText, jobDescription || "General candidate questions for " + jobTitle);

    const interview = await Interview.create({
      userId: req.user.id,
      jobTitle,
      jobDescription: jobDescription || "",
      questions,
      responses: [],
      status: "Pending",
    });

    res.status(201).json({
      message: "Mock interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Error in generateMockInterview:", error);
    res.status(500).json({ message: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, question, userAnswer } = req.body;

    if (!interviewId || !question || userAnswer === undefined) {
      return res.status(400).json({ message: "Interview ID, question, and user answer are required." });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    // Evaluate answer with Gemini
    const evaluation = await evaluateAnswer(question, userAnswer);

    // Save response
    const newResponse = {
      question,
      userAnswer,
      feedback: evaluation.feedback,
      rating: evaluation.rating,
    };
    
    interview.responses.push(newResponse);
    await interview.save();

    res.status(200).json({
      message: "Answer submitted and evaluated",
      responseEvaluation: newResponse,
    });
  } catch (error) {
    console.error("Error in submitAnswer:", error);
    res.status(500).json({ message: error.message });
  }
};

const completeMockInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required." });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (interview.responses.length === 0) {
      return res.status(400).json({ message: "Cannot complete an interview with no answers." });
    }

    // Calculate score: average of ratings out of 5, mapped to a percentage (x * 20)
    const sumRatings = interview.responses.reduce((sum, res) => sum + res.rating, 0);
    const avgRating = sumRatings / interview.responses.length;
    const overallScore = Math.round(avgRating * 20);

    // Generate overall feedback with Gemini
    const overallFeedbackResult = await generateOverallInterviewFeedback(interview.responses);

    interview.overallScore = overallScore;
    interview.overallFeedback = overallFeedbackResult.overallFeedback;
    interview.status = "Completed";

    await interview.save();

    res.status(200).json({
      message: "Interview session completed successfully",
      interview,
    });
  } catch (error) {
    console.error("Error in completeMockInterview:", error);
    res.status(500).json({ message: error.message });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .select("jobTitle status overallScore createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error in getInterviewHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }
    res.status(200).json({ interview });
  } catch (error) {
    console.error("Error in getInterviewById:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateMockInterview,
  submitAnswer,
  completeMockInterview,
  getInterviewHistory,
  getInterviewById,
};
